import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export async function POST(req) {
    try {
        console.log('[Register API] Starting registration...');
        await dbConnect();
        console.log('[Register API] DB connected');

        const body = await req.json();
        const { name, email, password, age, gender } = body;
        console.log(`[Register API] Registering user: ${email}`);

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        if (!age || parseInt(age) < 18) {
            return NextResponse.json({ message: 'You must be at least 18 years old' }, { status: 400 });
        }

        if (!gender) {
            return NextResponse.json({ message: 'Gender is required' }, { status: 400 });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log(`[Register API] User ${email} already exists`);
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            age: parseInt(age),
            gender
        });

        if (user) {
            console.log(`[Register API] User ${email} created successfully`);
            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json({
                ...userObj,
                token: generateToken(user._id)
            }, { status: 201 });
        } else {
            return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
        }
    } catch (error) {
        console.error('[Register API] Critical Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // Handle MongoDB duplicate key error (11000)
        if (error.code === 11000 || error.message?.includes('E11000')) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors || {}).map(e => e.message);
            return NextResponse.json({ message: messages.join(', ') || 'Validation failed' }, { status: 400 });
        }

        return NextResponse.json({
            message: `Registration Error: ${error.message || 'Unknown error'}`,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}

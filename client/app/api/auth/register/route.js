import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export async function POST(req) {
    try {
        await dbConnect();

        // Ensure User model is properly loaded
        if (!User || typeof User.findOne !== 'function') {
            console.error("User model is not correctly initialized", User);
            return NextResponse.json({ message: 'Database model error' }, { status: 500 });
        }

        const { name, email, password, age, gender } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const user = await User.create({ name, email, password, age, gender });
        if (user) {
            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json({
                ...userObj,
                token: generateToken(user._id)
            }, { status: 201 });
        }
    } catch (error) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

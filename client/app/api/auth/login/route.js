import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json({
                ...userObj,
                token: generateToken(user._id)
            });
        } else {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

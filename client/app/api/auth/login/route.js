import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
    return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export async function POST(req) {
    try {
        console.log('[Login API] Starting login...');
        await dbConnect();

        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        console.log(`[Login API] Looking up user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[Login API] User not found: ${email}`);
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log(`[Login API] Login successful for: ${email}`);
            const userObj = user.toObject();
            delete userObj.password;

            return NextResponse.json({
                ...userObj,
                token: generateToken(user._id)
            });
        } else {
            console.log(`[Login API] Wrong password for: ${email}`);
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }
    } catch (error) {
        console.error('[Login API] Error:', error);
        return NextResponse.json({ message: error.message || 'Login failed' }, { status: 500 });
    }
}

import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Ensure User model is properly loaded
        if (!User || typeof User.findById !== 'function') {
            console.error("User model is not correctly initialized in Profile Route", User);
            return NextResponse.json({ message: 'Database model error' }, { status: 500 });
        }

        const user = await User.findById(decoded.id);
        if (user) {
            const userObj = user.toObject();
            delete userObj.password;
            return NextResponse.json(userObj);
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

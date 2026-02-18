import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const user = await User.findById(id).select('-password');
        if (user) {
            return NextResponse.json(user.toObject());
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Get User By ID Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

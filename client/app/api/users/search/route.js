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

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        if (!query) {
            return NextResponse.json([]);
        }

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Search by name or interests (case-insensitive)
        const regexQuery = { $regex: query, $options: 'i' };

        const users = await User.find({
            _id: { $ne: currentUser._id },
            $or: [
                { name: regexQuery },
                { interests: { $in: [new RegExp(query, 'i')] } },
                { bio: regexQuery }
            ]
        })
            .select('-password -__v')
            .limit(30);

        return NextResponse.json(users);
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

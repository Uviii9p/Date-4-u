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

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const excludeIds = [
            ...(currentUser.likes || []),
            ...(currentUser.dislikes || []),
            ...(currentUser.matches || []),
            currentUser._id
        ];

        let query = {
            _id: { $nin: excludeIds },
            age: { $gte: 18 }
        };

        if (currentUser.genderPreference && currentUser.genderPreference !== 'both') {
            query.gender = currentUser.genderPreference;
        }

        const users = await User.find(query).limit(20);

        // Sort by common interests matching score
        const sortedUsers = users.map(user => {
            const userObj = user.toObject();
            const commonInterests = (userObj.interests || []).filter(interest =>
                (currentUser.interests || []).includes(interest)
            );
            return { ...userObj, matchScore: commonInterests.length };
        }).sort((a, b) => b.matchScore - a.matchScore);

        return NextResponse.json(sortedUsers);
    } catch (error) {
        console.error('Discovery API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

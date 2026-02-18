import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Match from '@/models/Match';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// GET /api/matches - get all matches for the current user
export async function GET(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const matchIds = user.matches || [];
        const matches = await User.find({ _id: { $in: matchIds } }).select('-password');
        return NextResponse.json(matches.map(u => u.toObject()));
    } catch (error) {
        console.error('Get Matches Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/matches - swipe on a user
export async function POST(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { targetUserId, direction } = await req.json();
        if (!targetUserId || !direction) {
            return NextResponse.json({ message: 'targetUserId and direction are required' }, { status: 400 });
        }

        const currentUser = await User.findById(decoded.id);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (direction === 'like') {
            // Add to likes
            if (!currentUser.likes.includes(targetUserId)) {
                currentUser.likes.push(targetUserId);
                await currentUser.save();
            }

            // Check for mutual like (match!)
            if (targetUser.likes && targetUser.likes.includes(decoded.id.toString())) {
                // It's a match!
                if (!currentUser.matches.includes(targetUserId)) {
                    currentUser.matches.push(targetUserId);
                    await currentUser.save();
                }
                if (!targetUser.matches.includes(decoded.id.toString())) {
                    targetUser.matches.push(decoded.id.toString());
                    await targetUser.save();
                }

                // Create match record
                await Match.create({ users: [decoded.id.toString(), targetUserId] });

                // Create chat
                const existingChat = await Chat.findOne({
                    members: { $all: [decoded.id.toString(), targetUserId] }
                });
                if (!existingChat) {
                    await Chat.create({ members: [decoded.id.toString(), targetUserId], messages: [] });
                }

                const targetObj = targetUser.toObject();
                delete targetObj.password;
                return NextResponse.json({ match: true, targetUser: targetObj });
            }
        } else {
            // Dislike
            if (!currentUser.dislikes.includes(targetUserId)) {
                currentUser.dislikes.push(targetUserId);
                await currentUser.save();
            }
        }

        return NextResponse.json({ match: false });
    } catch (error) {
        console.error('Swipe Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

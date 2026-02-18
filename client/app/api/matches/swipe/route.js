import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST /api/matches/swipe - handle swipe action
export async function POST(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Redirect to the parent route's POST handler
        // This route exists to match the /api/matches/swipe path from the frontend
        const { targetUserId, direction } = await req.json();

        const currentUser = await User.findById(decoded.id);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const Match = (await import('@/models/Match')).default;
        const Chat = (await import('@/models/Chat')).default;

        if (direction === 'like') {
            if (!currentUser.likes.includes(targetUserId)) {
                currentUser.likes.push(targetUserId);
                await currentUser.save();
            }

            if (targetUser.likes && targetUser.likes.includes(decoded.id.toString())) {
                if (!currentUser.matches.includes(targetUserId)) {
                    currentUser.matches.push(targetUserId);
                    await currentUser.save();
                }
                if (!targetUser.matches.includes(decoded.id.toString())) {
                    targetUser.matches.push(decoded.id.toString());
                    await targetUser.save();
                }

                await Match.create({ users: [decoded.id.toString(), targetUserId] });

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
            if (!currentUser.dislikes.includes(targetUserId)) {
                currentUser.dislikes.push(targetUserId);
                await currentUser.save();
            }
        }

        return NextResponse.json({ match: false });
    } catch (error) {
        console.error('Swipe API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

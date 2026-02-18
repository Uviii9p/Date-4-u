import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// GET /api/chat - get all chats for current user
export async function GET(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const chats = await Chat.find({ members: decoded.id.toString() });

        // Populate members manually
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const rawChat = chat.toObject();
            const populatedMembers = await Promise.all(rawChat.members.map(async (memberId) => {
                const u = await User.findById(memberId).select('-password');
                return u ? u.toObject() : { _id: memberId, name: 'Unknown' };
            }));
            return { ...rawChat, members: populatedMembers };
        }));

        const sorted = populatedChats.sort((a, b) =>
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );

        return NextResponse.json(sorted);
    } catch (error) {
        console.error('Get Chats Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

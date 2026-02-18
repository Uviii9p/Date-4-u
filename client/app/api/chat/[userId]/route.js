import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// GET /api/chat/[userId] - get messages with a specific user
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await params;

        let chat = await Chat.findOne({
            members: { $all: [decoded.id.toString(), userId] }
        });

        if (!chat) {
            // Create new chat if not found
            chat = await Chat.create({
                members: [decoded.id.toString(), userId],
                messages: []
            });
        }

        const rawChat = chat.toObject();
        const populatedMembers = await Promise.all(rawChat.members.map(async (id) => {
            const u = await User.findById(id).select('_id name images');
            return u ? u.toObject() : { _id: id, name: 'Unknown' };
        }));

        return NextResponse.json({ ...rawChat, members: populatedMembers });
    } catch (error) {
        console.error('Get Messages Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

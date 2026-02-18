import dbConnect from '@/lib/mongoose';
import Chat from '@/models/Chat';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST /api/chat/send-media - send media in chat
// Note: On Vercel serverless, file uploads are limited. 
// This is a simplified version that handles the API contract.
export async function POST(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const receiverId = formData.get('receiverId');
        const media = formData.get('media');

        if (!receiverId) {
            return NextResponse.json({ message: 'receiverId is required' }, { status: 400 });
        }

        let chat = await Chat.findOne({
            members: { $all: [decoded.id.toString(), receiverId] }
        });

        if (!chat) {
            chat = await Chat.create({
                members: [decoded.id.toString(), receiverId],
                messages: []
            });
        }

        // For serverless v-deployments (Vercel), we convert media to base64
        // to avoid filesystem issues and use MongoDB as the storage.
        const mediaType = media?.type?.startsWith('image/') ? 'image' : 'video';

        let mediaUrl = '';
        if (media && media instanceof Blob) {
            const buffer = Buffer.from(await media.arrayBuffer());
            const base64 = buffer.toString('base64');
            mediaUrl = `data:${media.type};base64,${base64}`;
        }

        const newMessage = {
            senderId: decoded.id.toString(),
            text: mediaType === 'image' ? '📷 Photo' : '🎥 Video',
            type: mediaType,
            mediaUrl: mediaUrl,
            createdAt: new Date(),
            seen: false
        };

        chat.messages.push(newMessage);
        chat.updatedAt = new Date();
        await chat.save();

        const rawChat = chat.toObject();
        const populatedMembers = await Promise.all(rawChat.members.map(async (id) => {
            const u = await User.findById(id).select('_id name images');
            return u ? u.toObject() : { _id: id, name: 'Unknown' };
        }));

        return NextResponse.json({ ...rawChat, members: populatedMembers });
    } catch (error) {
        console.error('Send Media Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

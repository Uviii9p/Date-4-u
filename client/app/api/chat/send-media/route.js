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

        // For serverless, we'd typically upload to a cloud storage (S3, Cloudinary, etc.)
        // For now, send a placeholder response
        const mediaType = media?.type?.startsWith('image/') ? 'image' : 'video';

        const newMessage = {
            senderId: decoded.id.toString(),
            text: mediaType === 'image' ? '📷 Photo' : '🎥 Video',
            type: mediaType,
            mediaUrl: '',  // Would need cloud storage URL
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

import dbConnect from '@/lib/mongoose';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST /api/chat/send - send a text message
export async function POST(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { text, receiverId } = await req.json();

        if (!text || !receiverId) {
            return NextResponse.json({ message: 'text and receiverId are required' }, { status: 400 });
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

        const newMessage = {
            senderId: decoded.id.toString(),
            text,
            type: 'text',
            createdAt: new Date(),
            seen: false
        };

        chat.messages.push(newMessage);
        chat.updatedAt = new Date();
        await chat.save();

        return NextResponse.json(chat.toObject());
    } catch (error) {
        console.error('Send Message Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

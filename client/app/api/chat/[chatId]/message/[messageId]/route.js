import dbConnect from '@/lib/mongoose';
import Chat from '@/models/Chat';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// DELETE /api/chat/[chatId]/message/[messageId] - delete a message
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { chatId, messageId } = await params;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return NextResponse.json({ message: 'Chat not found' }, { status: 404 });
        }

        const messageIndex = chat.messages.findIndex(m => m._id.toString() === messageId);
        if (messageIndex === -1) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        if (chat.messages[messageIndex].senderId !== decoded.id.toString()) {
            return NextResponse.json({ message: 'Unauthorized to delete this message' }, { status: 403 });
        }

        chat.messages.splice(messageIndex, 1);
        chat.updatedAt = new Date();
        await chat.save();

        return NextResponse.json({ message: 'Message deleted successfully', chatId, messageId });
    } catch (error) {
        console.error('Delete Message Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

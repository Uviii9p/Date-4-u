import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    members: [{ type: String }],
    messages: [
        {
            senderId: { type: String, required: true },
            text: { type: String },
            type: { type: String, enum: ['text', 'image', 'video', 'voice', 'file'], default: 'text' },
            mediaUrl: { type: String },
            fileName: { type: String },
            fileSize: { type: Number },
            duration: { type: Number },
            seen: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);

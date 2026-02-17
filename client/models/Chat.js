const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    members: [{ type: String }], // Use String to support both UUIDs and ObjectIds if needed, but preferably ObjectIds in Mongoose
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

module.exports = mongoose.model('Chat', chatSchema);

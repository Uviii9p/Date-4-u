const db = require('../db');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Configure multer for chat media uploads
const CHAT_UPLOADS_DIR = path.join(__dirname, '..', 'data', 'uploads', 'chat');
if (!fs.existsSync(CHAT_UPLOADS_DIR)) {
    fs.mkdirSync(CHAT_UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CHAT_UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `chat-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

    if ([...allowedImageTypes, ...allowedVideoTypes].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only images and videos are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const getChats = async (req, res) => {
    try {
        const chats = await db.chats.find({ 'members': req.user.id });

        // Populate members manually
        const populatedChats = await Promise.all(chats.map(async (chat) => {
            const rawChat = chat.toObject ? chat.toObject() : chat;
            const populatedMembers = await Promise.all(rawChat.members.map(async (memberId) => {
                const u = await db.users.findById(memberId);
                if (u) {
                    const safeUser = u.toObject ? u.toObject() : u;
                    delete safeUser.password;
                    return safeUser;
                }
                return memberId;
            }));
            return { ...rawChat, members: populatedMembers };
        }));

        res.json(populatedChats.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        let chat = await db.chats.findOne({
            members: { $all: [req.user.id, req.params.userId] }
        });

        if (!chat) {
            // Create new chat if not found (Enable direct messaging)
            chat = await db.chats.create({
                members: [req.user.id, req.params.userId],
                messages: []
            });
        }

        const rawChat = chat.toObject ? chat.toObject() : chat;
        const populatedMembers = await Promise.all(rawChat.members.map(async (id) => {
            const u = await db.users.findById(id);
            return u ? { _id: u._id, name: u.name, images: u.images } : id;
        }));
        res.json({ ...rawChat, members: populatedMembers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    const { text, receiverId } = req.body;
    try {
        let chat = await db.chats.findOne({
            members: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            chat = await db.chats.create({
                members: [req.user.id, receiverId],
                messages: []
            });
        }

        const newMessage = {
            _id: uuidv4(),
            senderId: req.user.id,
            text,
            type: 'text',
            createdAt: new Date().toISOString(),
            seen: false
        };

        const updatedChat = await db.chats.findByIdAndUpdate(chat._id, {
            $push: { messages: newMessage },
            updatedAt: new Date().toISOString()
        });

        res.json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMedia = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!receiverId) {
            return res.status(400).json({ message: 'receiverId is required' });
        }

        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const mediaType = isImage ? 'image' : isVideo ? 'video' : 'file';
        const mediaUrl = `/uploads/chat/${file.filename}`;

        let chat = await db.chats.findOne({
            members: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            chat = await db.chats.create({
                members: [req.user.id, receiverId],
                messages: []
            });
        }

        const newMessage = {
            _id: uuidv4(),
            senderId: req.user.id,
            text: mediaType === 'image' ? '📷 Photo' : '🎥 Video',
            type: mediaType,
            mediaUrl: mediaUrl,
            fileName: file.originalname,
            fileSize: file.size,
            createdAt: new Date().toISOString(),
            seen: false
        };

        const updatedChat = await db.chats.findByIdAndUpdate(chat._id, {
            $push: { messages: newMessage },
            updatedAt: new Date().toISOString()
        });

        res.json(updatedChat);
    } catch (error) {
        console.error('sendMedia error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.params;
        const chat = await db.chats.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const rawChat = chat.toObject ? chat.toObject() : chat;
        const messageIndex = rawChat.messages.findIndex(m => m._id === messageId);
        if (messageIndex === -1) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (rawChat.messages[messageIndex].senderId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this message' });
        }

        const updatedMessages = rawChat.messages.filter(m => m._id !== messageId);

        const updatedChat = await db.chats.findByIdAndUpdate(chatId, {
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
        });

        res.json({ message: 'Message deleted successfully', chatId, messageId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChats, getMessages, sendMessage, sendMedia, deleteMessage, upload };

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
        const chats = db.chats.find({ 'members._id': req.user.id });

        // Populate members manually
        const populatedChats = chats.map(chat => {
            const populatedMembers = chat.members.map(memberId => {
                const u = db.users.findById(memberId);
                if (u) {
                    const { password, ...safeUser } = u;
                    return safeUser;
                }
                return memberId;
            });
            return { ...chat, members: populatedMembers };
        });

        res.json(populatedChats.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        let chat = db.chats.findOne({
            members: { $all: [req.user.id, req.params.userId] }
        });

        if (!chat) {
            // Create new chat if not found (Enable direct messaging)
            chat = db.chats.create({
                members: [req.user.id, req.params.userId],
                messages: []
            });
        }

        const populatedMembers = chat.members.map(id => {
            const u = db.users.findById(id);
            return u ? { _id: u._id, name: u.name, images: u.images } : id;
        });
        res.json({ ...chat, members: populatedMembers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    const { text, receiverId } = req.body;
    try {
        let chat = db.chats.findOne({
            members: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            chat = db.chats.create({
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

        chat = db.chats.findByIdAndUpdate(chat._id, {
            $push: { messages: newMessage },
            updatedAt: new Date().toISOString()
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMedia = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const file = req.file;

        console.log('sendMedia called:', { receiverId, file: file ? file.filename : 'no file' });

        if (!file) {
            console.error('No file uploaded in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!receiverId) {
            console.error('No receiverId provided');
            return res.status(400).json({ message: 'receiverId is required' });
        }

        // Determine media type
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        const mediaType = isImage ? 'image' : isVideo ? 'video' : 'file';

        // Create media URL (relative to server root)
        const mediaUrl = `/uploads/chat/${file.filename}`;

        console.log('Media file details:', {
            originalName: file.originalname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            mediaType,
            mediaUrl,
            storagePath: file.path
        });

        let chat = db.chats.findOne({
            members: { $all: [req.user.id, receiverId] }
        });

        if (!chat) {
            console.log('Creating new chat for media message');
            chat = db.chats.create({
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

        console.log('Creating message:', newMessage);

        chat = db.chats.findByIdAndUpdate(chat._id, {
            $push: { messages: newMessage },
            updatedAt: new Date().toISOString()
        });

        console.log('Media message saved successfully');
        res.json(chat);
    } catch (error) {
        console.error('sendMedia error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.params;
        const chat = db.chats.findById(chatId);

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if message exists and user is sender
        const messageIndex = chat.messages.findIndex(m => m._id === messageId);
        if (messageIndex === -1) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (chat.messages[messageIndex].senderId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this message' });
        }

        // Remove message
        const updatedMessages = chat.messages.filter(m => m._id !== messageId);

        const updatedChat = db.chats.findByIdAndUpdate(chatId, {
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
        });

        res.json({ message: 'Message deleted successfully', chatId, messageId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getChats, getMessages, sendMessage, sendMedia, deleteMessage, upload };

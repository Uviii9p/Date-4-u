const db = require('../db');

const socketMain = (io) => {
    let onlineUsers = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('setup', (userId) => {
            if (!userId) return;
            socket.join(userId);
            onlineUsers.set(userId, socket.id);
            socket.emit('connected');

            // Update online status in DB
            db.users.findByIdAndUpdate(userId, { onlineStatus: true });
        });

        socket.on('join chat', (room) => {
            if (!room) return;
            socket.join(room);
            console.log('User joined room:', room);
        });

        socket.on('typing', (room) => {
            if (!room) return;
            socket.in(room).emit('typing');
        });

        socket.on('stop typing', (room) => {
            if (!room) return;
            socket.in(room).emit('stop typing');
        });

        socket.on('new message', (newMessageReceived) => {
            if (!newMessageReceived || !newMessageReceived.chat) return;
            let chat = newMessageReceived.chat;
            if (!chat.members) return console.log('Chat members not defined');

            chat.members.forEach((user) => {
                const userId = typeof user === 'string' ? user : user._id;
                if (userId == newMessageReceived.senderId) return;
                socket.in(userId).emit('message received', newMessageReceived);
            });
        });

        socket.on('delete message', (data) => {
            if (!data || !data.chatId || !data.messageId || !data.receiverId) return;
            socket.in(data.receiverId).emit('message deleted', {
                chatId: data.chatId,
                messageId: data.messageId
            });
        });

        // WebRTC Signaling
        socket.on('call user', (data) => {
            if (!data || !data.userToCall) return;
            socket.to(data.userToCall).emit('call user', {
                signal: data.signalData,
                from: data.from,
                name: data.name
            });
        });

        socket.on('answer call', (data) => {
            if (!data || !data.to) return;
            socket.to(data.to).emit('call accepted', data.signal);
        });

        socket.on('end call', (data) => {
            if (!data || !data.to) return;
            socket.to(data.to).emit('call ended');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            // Find userId for this socketId to set offline
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    db.users.findByIdAndUpdate(userId, { onlineStatus: false, lastSeen: new Date().toISOString() });
                    onlineUsers.delete(userId);
                    break;
                }
            }
        });
    });
};

module.exports = socketMain;

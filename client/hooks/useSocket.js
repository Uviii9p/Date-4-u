"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.1.1.1:5000';

export const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.emit('setup', userId);

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return socket;
};

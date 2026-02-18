"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.1.1.1:5000';

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user?._id) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.emit('setup', user._id);

        return () => {
            newSocket.disconnect();
        };
    }, [user?._id]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

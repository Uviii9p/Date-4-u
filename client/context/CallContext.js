"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useRouter } from 'next/navigation';
import { Phone, Video, X, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const router = useRouter();

    const [incomingCall, setIncomingCall] = useState(null);
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on("call user", (data) => {
                setIncomingCall(data);
                // Play ringtone or vibration if possible
            });

            socket.on("call ended", () => {
                setIncomingCall(null);
                setIsCalling(false);
            });
        }
    }, [socket]);

    const acceptCall = () => {
        if (incomingCall) {
            const userId = incomingCall.from;
            const type = incomingCall.signal?.video ? 'video' : 'audio';
            // DON'T clear incomingCall here! CallPage needs it.
            router.push(`/call/${userId}?type=${type}&receiving=true`);
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            socket.emit("end call", { to: incomingCall.from });
            setIncomingCall(null);
        }
    };

    return (
        <CallContext.Provider value={{ isCalling, setIsCalling, incomingCall, setIncomingCall }}>
            {children}

            <AnimatePresence>
                {incomingCall && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 20, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[1000] flex justify-center px-4"
                    >
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-[2rem] p-4 flex items-center gap-4 shadow-2xl max-w-sm w-full backdrop-blur-xl">
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-500">
                                <PhoneCall className="animate-pulse" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-white">{incomingCall.name || "Incoming Signal"}</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Encrypted Frequency Request</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={rejectCall}
                                    className="p-3 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={acceptCall}
                                    className="p-3 bg-green-500 text-white rounded-2xl animate-bounce shadow-lg shadow-green-500/20"
                                >
                                    <Phone size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);

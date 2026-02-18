"use client";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { useSocket } from '@/context/SocketContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, PhoneCall, Shield, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Global variable for Peer library to avoid multiple imports and SSR issues
let Peer;

export default function CallPage() {
    const { userId } = useParams();
    const { user } = useAuth();
    const socket = useSocket();
    const router = useRouter();
    const searchParams = useSearchParams();

    const isVideoCall = searchParams.get('type') === 'video';
    const isReceiving = searchParams.get('receiving') === 'true';

    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [micActive, setMicActive] = useState(true);
    const [videoActive, setVideoActive] = useState(isVideoCall);
    const [status, setStatus] = useState("Initializing Encryption...");
    const [showControls, setShowControls] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    // Import Peer library only on client
    useEffect(() => {
        if (typeof window !== 'undefined' && !Peer) {
            import('simple-peer').then((module) => {
                Peer = module.default;
            });
        }
    }, []);

    const setupStream = useCallback(async () => {
        try {
            const currentStream = await navigator.mediaDevices.getUserMedia({
                video: isVideoCall,
                audio: true
            });
            setStream(currentStream);
            if (myVideo.current) myVideo.current.srcObject = currentStream;
            return currentStream;
        } catch (err) {
            console.error("Media error:", err);
            setStatus("Media Access Denied");
            return null;
        }
    }, [isVideoCall]);

    const callUser = useCallback((mediaStream) => {
        if (!Peer || !mediaStream) return;

        setStatus("Calling Frequency...");
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: mediaStream,
        });

        peer.on("signal", (data) => {
            socket.emit("call user", {
                userToCall: userId,
                signalData: data,
                from: user?._id,
                name: user?.name,
            });
        });

        peer.on("stream", (remoteStream) => {
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
            setCallAccepted(true);
            setStatus("Signal Locked");
        });

        connectionRef.current = peer;
    }, [userId, user, socket]);

    const { incomingCall, setIncomingCall } = useCall();

    const answerCall = useCallback((mediaStream) => {
        if (!Peer || !mediaStream || !socket || !incomingCall) return;

        setStatus("Synchronizing Frequency...");

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: mediaStream,
        });

        peer.on("signal", (signalData) => {
            socket.emit("answer call", { signal: signalData, to: userId });
        });

        peer.on("stream", (remoteStream) => {
            if (userVideo.current) userVideo.current.srcObject = remoteStream;
            setCallAccepted(true);
            setStatus("Signal Locked");
        });

        peer.signal(incomingCall.signal);
        connectionRef.current = peer;

        // Clear the incoming call state once answered
        setIncomingCall(null);
    }, [userId, socket, incomingCall, setIncomingCall]);

    useEffect(() => {
        if (!socket || !Peer) return;

        socket.on("call accepted", (signal) => {
            if (connectionRef.current && !callAccepted) {
                setCallAccepted(true);
                connectionRef.current.signal(signal);
                setStatus("Signal Locked");
            }
        });

        setupStream().then((mediaStream) => {
            if (mediaStream) {
                if (isReceiving) {
                    answerCall(mediaStream);
                } else {
                    callUser(mediaStream);
                }
            }
        });

        socket.on("call ended", () => {
            leaveCall();
        });

        return () => {
            socket.off("call accepted");
            socket.off("call ended");
            if (connectionRef.current) connectionRef.current.destroy();
        };
    }, [socket, Peer, isReceiving, setupStream, callUser, answerCall, callAccepted]);

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        socket.emit("end call", { to: userId });

        // Clean up tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        router.push(`/chat/${userId}`);
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micActive;
            setMicActive(!micActive);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !videoActive;
            setVideoActive(!videoActive);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-pink-500/5 to-transparent" />
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
            </div>

            {/* Main Viewport */}
            <div className="flex-1 relative z-10 flex flex-col justify-center items-center">
                <AnimatePresence mode="wait">
                    {callAccepted && !callEnded ? (
                        <motion.div
                            key="remote"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full relative"
                        >
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="waiting"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center gap-8"
                        >
                            <div className="relative">
                                <div className="w-36 h-36 rounded-[3rem] bg-gradient-to-br from-pink-500 to-purple-600 p-1 animate-pulse">
                                    <div className="w-full h-full rounded-[2.9rem] bg-[#0a0a0b] flex items-center justify-center">
                                        <User size={64} className="text-pink-500" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-black shadow-2xl">
                                    <Zap size={20} fill="currentColor" />
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">{isReceiving ? "Incoming Transmission" : "Initiating Link"}</h2>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60">{status}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Local Preview Overlay */}
                <AnimatePresence>
                    {stream && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="absolute top-8 right-8 w-32 h-48 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0b] group"
                        >
                            <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Shield size={20} className="text-white/40" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* UI Top Overlay */}
            <div className="absolute top-0 left-0 right-0 p-8 z-20 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={() => router.back()} className="p-4 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 text-white/50 hover:text-white transition-all">
                        <Info size={20} />
                    </button>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-1">Secure Channel</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-pink-500">{userId.slice(0, 12).toUpperCase()}</p>
                </div>
            </div>

            {/* Controls Bar */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="absolute bottom-12 left-0 right-0 z-50 flex justify-center items-center gap-6 px-4"
                    >
                        <div className="bg-[#0f0f11]/80 backdrop-blur-3xl border border-white/10 p-4 rounded-[2.5rem] flex items-center gap-6 shadow-2xl">
                            <button
                                onClick={toggleMic}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${micActive ? 'bg-white/5 border-white/10 text-white/50' : 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20'}`}
                            >
                                {micActive ? <Mic size={22} /> : <MicOff size={22} />}
                            </button>

                            <button
                                onClick={leaveCall}
                                className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all group"
                            >
                                <PhoneOff size={32} className="group-hover:rotate-12 transition-transform" />
                            </button>

                            <button
                                onClick={toggleVideo}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${videoActive ? 'bg-white/5 border-white/10 text-white/50' : 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20'}`}
                            >
                                {videoActive ? <Video size={22} /> : <VideoOff size={22} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

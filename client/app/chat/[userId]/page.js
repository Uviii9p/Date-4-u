"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Shield, Info, ImageIcon, Film, X, Camera, Paperclip, Play, Download, Trash2, MapPin, Zap, Lock, Sparkles, Activity, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatRoom() {
    const { userId } = useParams();
    const { user } = useAuth();
    const socket = useSocket(user?._id);
    const router = useRouter();
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();

    const femalePlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop";
    const malePlaceholder = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop";

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/chat/${userId}`);
                setChat(data);
                setMessages(data.messages);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchMessages();
    }, [userId, user]);

    useEffect(() => {
        if (showCamera && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [showCamera, cameraStream]);

    useEffect(() => {
        if (socket) {
            socket.on('message received', (newMessage) => {
                if (newMessage.senderId === userId) {
                    setMessages(prev => [...prev, newMessage]);
                }
            });

            socket.on('typing', () => setIsTyping(true));
            socket.on('stop typing', () => setIsTyping(false));

            socket.on('message deleted', ({ messageId }) => {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            });
        }
    }, [socket, userId]);

    useEffect(() => {
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!text.trim()) return;

        socket.emit('stop typing', userId);
        setTyping(false);

        try {
            const { data } = await api.post('/chat/send', { text, receiverId: userId });
            const newMessage = data.messages[data.messages.length - 1];
            setMessages(prev => [...prev, newMessage]);
            socket.emit('new message', { ...newMessage, chat: data });
            setText('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await api.delete(`/chat/${chat._id}/message/${messageId}`);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            socket.emit('delete message', { chatId: chat._id, messageId, receiverId: userId });
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            alert('Please select an image or video file.');
            return;
        }

        const url = URL.createObjectURL(file);
        setMediaPreview({
            file,
            url,
            type: isImage ? 'image' : 'video',
            name: file.name,
            size: file.size
        });
        setShowAttachMenu(false);
    };

    // Camera Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });
            setCameraStream(stream);
            setShowCamera(true);
            setShowAttachMenu(false);
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                const url = URL.createObjectURL(file);
                setMediaPreview({
                    file,
                    url,
                    type: 'image',
                    name: file.name,
                    size: file.size
                });
                closeCamera();
            }, 'image/jpeg', 0.9);
        }
    };

    const handleSendMedia = async () => {
        if (!mediaPreview?.file) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('media', mediaPreview.file);
            formData.append('receiverId', userId);

            const { data } = await api.post('/chat/send-media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newMessage = data.messages[data.messages.length - 1];
            setMessages(prev => [...prev, newMessage]);
            socket.emit('new message', { ...newMessage, chat: data });
            setMediaPreview(null);
        } catch (err) {
            console.error(err);
            alert('Failed to send media');
        } finally {
            setUploading(false);
        }
    };

    const typingHandler = (e) => {
        setText(e.target.value);
        if (!socket) return;

        if (!typing) {
            setTyping(true);
            socket.emit('typing', userId);
        }

        let lastTypingTime = new Date().getTime();
        setTimeout(() => {
            let timeNow = new Date().getTime();
            if (timeNow - lastTypingTime >= 3000 && typing) {
                socket.emit('stop typing', userId);
                setTyping(false);
            }
        }, 3000);
    };

    const getRecipientAvatar = (recipient) => {
        if (!recipient?.images?.[0]) return recipient?.gender === 'female' ? femalePlaceholder : malePlaceholder;
        const img = recipient.images[0];
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
        return `${backendUrl}${img}`;
    };

    if (!chat) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/40">Syncing Frequencies</p>
        </div>
    );

    const recipient = chat.members.find(m => m._id?.toString() === userId?.toString()) || { name: 'Vibe User' };

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0b] text-white relative overflow-hidden font-sans">
            {/* Background Aesthetics */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-15%] right-[-15%] w-[60%] h-[60%] bg-pink-600/10 blur-[130px] rounded-full opacity-70" />
                <div className="absolute bottom-[-15%] left-[-15%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between p-4 px-6 bg-[#0a0a0b]/80 backdrop-blur-3xl border-b border-white/[0.05] sticky top-0 z-[100] shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/chat')} className="p-2.5 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl text-white/50 hover:text-white transition-all active:scale-95 border border-white/5 shadow-inner">
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => router.push(`/profile/${userId}`)}>
                        <div className="relative">
                            <div className="w-11 h-11 rounded-[1.2rem] overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover:scale-105">
                                <img src={getRecipientAvatar(recipient)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0b] shadow-lg ${recipient.onlineStatus ? 'bg-green-500' : 'bg-neutral-800'}`} />
                        </div>
                        <div>
                            <h4 className="font-black text-[15px] tracking-tight truncate leading-none mb-1.5">{recipient.name}</h4>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isTyping ? 'text-pink-500 animate-pulse' : 'text-white/30'}`}>
                                    {isTyping ? 'Typing...' : (recipient.onlineStatus ? 'Frequency: High' : 'Idle')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/call/${userId}?type=audio`)}
                        className="p-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl text-white/40 hover:text-white transition-all border border-white/5 shadow-lg"
                    >
                        <Phone size={18} />
                    </button>
                    <button
                        onClick={() => router.push(`/call/${userId}?type=video`)}
                        className="p-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl text-white/40 hover:text-white transition-all border border-white/5 shadow-lg"
                    >
                        <Video size={18} />
                    </button>
                    <button onClick={() => setShowOptions(!showOptions)} className="p-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl text-white/40 hover:text-white transition-all border border-white/5"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7 flex flex-col custom-scrollbar relative z-10 scroll-smooth">
                <div className="flex-1" />

                <div className="flex flex-col items-center py-12 opacity-30 select-none">
                    <div className="w-14 h-14 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center mb-5 rotate-12">
                        <Lock size={20} className="text-gray-500" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40 mb-1">Encrypted Signal</p>
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">Frequency Locked: {chat?._id?.slice(-8).toUpperCase()}</p>
                </div>

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId?.toString() === user._id?.toString();
                        const isMedia = msg.type === 'image' || msg.type === 'video';

                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                layout
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`group relative max-w-[80%] flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isOwn && (
                                        <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shadow-lg flex-shrink-0 mb-1">
                                            <img src={getRecipientAvatar(recipient)} className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <div className="relative group/bubble">
                                        <div className={`${isMedia ? 'p-1' : 'px-5 py-3.5'} rounded-[1.6rem] shadow-2xl transition-all ${isOwn
                                            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-tr-none ring-1 ring-white/10'
                                            : 'bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-none ring-1 ring-white/5'}`}>

                                            {isMedia ? (
                                                msg.type === 'image' ? (
                                                    <img src={msg.mediaUrl} className="max-w-[240px] rounded-[1.4rem] object-cover cursor-pointer hover:brightness-110 transition-all" onClick={() => setLightboxMedia(msg.mediaUrl)} />
                                                ) : (
                                                    <div className="relative w-[240px] aspect-video rounded-[1.4rem] overflow-hidden bg-black flex items-center justify-center">
                                                        <video src={msg.mediaUrl} className="w-full h-full object-cover opacity-70" />
                                                        <div className="absolute w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                                                            <Play className="text-white ml-1" fill="white" size={20} />
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <p className="text-[14px] leading-relaxed tracking-tight font-medium break-words whitespace-pre-wrap">{msg.text}</p>
                                            )}

                                            <div className="flex justify-between items-center mt-2.5 px-0.5 opacity-40">
                                                <span className="text-[8px] font-black uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isOwn && (
                                                    <div className="flex items-center gap-1">
                                                        {msg.seen ? <CheckCheck size={10} className="text-blue-400" /> : <Check size={10} />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        {isOwn && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg._id)}
                                                className="absolute -left-10 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/[0.03] hover:bg-red-500/20 text-white/20 hover:text-red-500 opacity-0 group-hover/bubble:opacity-100 transition-all active:scale-90 border border-white/5"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Media/Camera Previews */}
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="p-4 bg-[#0a0a0b] border-t border-white/[0.05] z-[110]">
                        <div className="flex items-center gap-5 bg-white/[0.03] p-4 rounded-[2rem] border border-white/10 shadow-inner">
                            <div className="relative w-22 h-22 rounded-[1.5rem] overflow-hidden shadow-2xl ring-2 ring-white/10">
                                {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center"><Film size={28} className="text-indigo-400" /></div>}
                                <button onClick={() => setMediaPreview(null)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:bg-red-500 transition-colors"><X size={12} /></button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-black truncate text-white uppercase tracking-tight mb-1">{mediaPreview.name}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    <p className="text-[9px] font-black text-green-500/70 uppercase tracking-widest">Signal Ready</p>
                                </div>
                            </div>
                            <button onClick={handleSendMedia} disabled={uploading} className="w-16 h-16 rounded-[1.5rem] bg-white text-black flex items-center justify-center shadow-xl active:scale-95 transition-all">
                                {uploading ? <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" /> : <Send size={24} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera Overlay */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-6">
                        <div className="flex justify-between items-center mb-8">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">Broadcasting Optical Sync</p>
                            <button onClick={closeCamera} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><X size={20} /></button>
                        </div>
                        <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                            <div className="absolute inset-0 border-[16px] border-black/20 pointer-events-none" />
                        </div>
                        <div className="py-12 flex justify-center items-center gap-10">
                            <div className="p-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600">
                                <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black border-4 border-black active:scale-90 transition-all">
                                    <Camera size={28} />
                                </button>
                            </div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Bar */}
            <footer className="p-5 px-6 bg-[#0a0a0b]/90 backdrop-blur-3xl border-t border-white/[0.05] pb-10 relative z-[90]">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3.5 max-w-2xl mx-auto">
                    <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-14 h-14 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] flex items-center justify-center text-white/30 hover:text-white transition-all border border-white/5 shadow-lg relative">
                        <Paperclip size={20} className={showAttachMenu ? 'rotate-45' : ''} />
                    </button>

                    <div className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-[1.8rem] px-6 py-[1.1rem] focus-within:bg-white/[0.07] focus-within:border-white/[0.15] transition-all shadow-inner">
                        <textarea
                            rows={1}
                            value={text}
                            onChange={typingHandler}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type a transmission..."
                            className="w-full bg-transparent outline-none text-[15px] font-medium resize-none placeholder:text-white/10 tracking-tight"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${text.trim() ? 'bg-gradient-to-br from-pink-500 to-purple-700 text-white' : 'bg-white/[0.02] text-white/5'}`}
                    >
                        <Send size={20} />
                    </button>
                </form>

                {/* Attachment Menu */}
                <AnimatePresence>
                    {showAttachMenu && (
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="absolute bottom-[105%] left-6 bg-[#0f0f11] border border-white/10 p-2.5 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] z-[100] min-w-[220px]">
                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-4 p-4.5 hover:bg-white/[0.04] rounded-[1.5rem] w-full group transition-all">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform"><ImageIcon size={18} /></div>
                                <div className="text-left">
                                    <span className="block text-[11px] font-black text-white uppercase tracking-widest">Media Matrix</span>
                                    <span className="block text-[8px] font-bold text-white/30 uppercase mt-0.5">Gallery / Files</span>
                                </div>
                            </button>
                            <button onClick={startCamera} className="flex items-center gap-4 p-4.5 hover:bg-white/[0.04] rounded-[1.5rem] w-full group transition-all border-t border-white/[0.03]">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform"><Camera size={18} /></div>
                                <div className="text-left">
                                    <span className="block text-[11px] font-black text-white uppercase tracking-widest">Optical Sync</span>
                                    <span className="block text-[8px] font-bold text-white/30 uppercase mt-0.5">Live Capture</span>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*" />
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
}

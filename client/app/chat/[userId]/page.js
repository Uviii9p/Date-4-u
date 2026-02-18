"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Shield, Info, ImageIcon, Film, X, Camera, Paperclip, Play, Download, Trash2, MapPin, Zap, Lock, Sparkles, Activity } from 'lucide-react';
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
    const scrollRef = useRef();
    const fileInputRef = useRef();

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
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.1.1.1:5000';
        return `${backendUrl}${img}`;
    };

    if (!chat) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-b-2 border-r-2 border-pink-500 rounded-full" />
            <p className="mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-pink-500/50">Establishing Secure Channel</p>
        </div>
    );

    const recipient = chat.members.find(m => m._id?.toString() === userId?.toString()) || { name: 'Vibe User' };

    return (
        <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-pink-500/5 blur-[120px] rounded-full opacity-60 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[120px] rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <header className="flex items-center justify-between p-5 bg-black/60 backdrop-blur-[40px] border-b border-white/5 sticky top-0 z-[100] shadow-2xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/chat')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 transition-all active:scale-95 shadow-lg border border-white/5">
                        <ArrowLeft size={22} />
                    </button>

                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push(`/profile/${userId}`)}>
                        <div className="relative">
                            <div className="w-13 h-13 rounded-[1.4rem] overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover:scale-105">
                                <img src={getRecipientAvatar(recipient)} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-black shadow-lg ${recipient.onlineStatus ? 'bg-green-500' : 'bg-gray-800'}`} />
                        </div>
                        <div className="max-w-[140px]">
                            <h4 className="font-black text-md tracking-tight truncate leading-none mb-1.5">{recipient.name}</h4>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-pink-500 animate-bounce' : (recipient.onlineStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-700')}`} />
                                <p className={`text-[8px] font-black uppercase tracking-widest ${isTyping ? 'text-pink-500' : 'text-gray-500'}`}>
                                    {isTyping ? 'Broadcasting...' : (recipient.onlineStatus ? 'Frequency: Active' : 'Offline')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all shadow-lg border border-white/5"><Phone size={18} /></button>
                    <button className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all shadow-lg border border-white/5"><Video size={18} /></button>
                    <button onClick={() => setShowOptions(!showOptions)} className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all shadow-lg border border-white/5"><MoreHorizontal size={18} /></button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col custom-scrollbar relative z-10">
                <div className="flex-1" />

                <div className="flex flex-col items-center py-20 opacity-20">
                    <div className="w-20 h-20 rounded-[2.5rem] border border-dashed border-white/30 flex items-center justify-center mb-6">
                        <Activity size={32} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Lock size={12} className="text-pink-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">End-to-End Frequency Lock</p>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId?.toString() === user._id?.toString();
                        const isMedia = msg.type === 'image' || msg.type === 'video';

                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, x: isOwn ? 20 : -20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                layout
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`group relative max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} flex items-end gap-3`}>
                                    {!isOwn && (
                                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-xl flex-shrink-0">
                                            <img src={getRecipientAvatar(recipient)} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`${isMedia ? 'p-1.5' : 'px-6 py-4'} rounded-[2rem] glass-card ${isOwn ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-purple-800 text-white rounded-tr-none shadow-[0_15px_35px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/20' : 'bg-white/[0.03] border-white/10 text-white/90 rounded-tl-none shadow-2xl ring-1 ring-white/5'}`}>
                                        {isMedia ? (
                                            msg.type === 'image' ? (
                                                <div className="relative group overflow-hidden rounded-[1.6rem]">
                                                    <img src={msg.mediaUrl} className="max-w-[280px] object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110" onClick={() => setLightboxMedia(msg.mediaUrl)} />
                                                </div>
                                            ) : (
                                                <div className="relative w-[280px] aspect-video rounded-[1.6rem] overflow-hidden bg-black flex items-center justify-center group">
                                                    <video src={msg.mediaUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    <Play className="text-white absolute" fill="white" size={24} />
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-[15px] font-medium leading-[1.6] tracking-tight whitespace-pre-wrap">{msg.text}</p>
                                        )}
                                        <div className={`flex justify-between items-center mt-2 px-1 ${isOwn ? 'text-white/40' : 'text-gray-600'}`}>
                                            <span className="text-[9px] font-black uppercase tracking-tight">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isOwn && <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">{msg.seen ? 'Read' : 'Locked'}</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} className="h-4" />
            </div>

            <footer className="p-6 bg-black/60 backdrop-blur-[50px] border-t border-white/5 pb-11 relative z-50">
                <AnimatePresence>
                    {mediaPreview && (
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="mb-6 p-1 bg-gradient-to-r from-pink-500/30 to-purple-600/30 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/10">
                            <div className="bg-neutral-900 rounded-[2.3rem] p-4 flex items-center gap-5">
                                <div className="relative w-20 h-20 rounded-[1.8rem] overflow-hidden shadow-2xl ring-2 ring-white/5">
                                    {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-500/20 flex items-center justify-center"><Film size={26} className="text-purple-400" /></div>}
                                    <button onClick={() => setMediaPreview(null)} className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 hover:bg-red-500 transition-colors"><X size={12} /></button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black truncate text-white tracking-tight uppercase">{mediaPreview.name}</p>
                                    <p className="text-[9px] font-black text-pink-500 mt-1 uppercase tracking-[0.2em]">Encryption Ready</p>
                                </div>
                                <button onClick={handleSendMedia} disabled={uploading} className="w-16 h-16 rounded-[1.8rem] bg-white text-black flex items-center justify-center shadow-[0_15px_35px_rgba(255,255,255,0.1)] active:scale-90 transition-all">
                                    {uploading ? <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" /> : <Send size={24} />}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-2xl mx-auto group">
                    <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95">
                        <Paperclip size={22} />
                    </button>

                    <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-[2rem] px-6 py-4.5 focus-within:border-pink-500/30 focus-within:bg-white/[0.06] transition-all ring-1 ring-white/5 shadow-inner">
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
                            placeholder="Identify transmission frequency..."
                            className="w-full bg-transparent outline-none text-[15px] font-medium resize-none placeholder:text-gray-800 tracking-tight"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-90 ${text.trim() ? 'bg-gradient-to-br from-pink-500 to-purple-700 text-white border-b-4 border-black/30' : 'bg-white/5 text-gray-800 cursor-not-allowed'}`}
                    >
                        <Send size={22} className={text.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                    </button>
                </form>

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*" />

                <AnimatePresence>
                    {showAttachMenu && (
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-32 left-8 bg-[#0d0d0d] border border-white/10 p-3 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-50 min-w-[200px] ring-1 ring-white/10">
                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-3xl w-full transition-all group">
                                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform"><ImageIcon size={20} /></div>
                                <div className="text-left">
                                    <span className="block text-xs font-black text-white uppercase tracking-widest">Visual Matrix</span>
                                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Image / Motion</span>
                                </div>
                            </button>
                            <button onClick={() => alert('Camera access requires HTTPS locally')} className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-3xl w-full transition-all group">
                                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform"><Camera size={20} /></div>
                                <div className="text-left">
                                    <span className="block text-xs font-black text-white uppercase tracking-widest">Optical Sync</span>
                                    <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Live Capture</span>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </footer>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}

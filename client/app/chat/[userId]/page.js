"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, MoreHorizontal, Shield, Info, ImageIcon, Film, X, Camera, Paperclip, Play, Download, Trash2, MapPin, Zap } from 'lucide-react';
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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const scrollRef = useRef();
    const fileInputRef = useRef();
    const videoInputRef = useRef();
    const cameraInputRef = useRef();
    const videoRef = useRef();
    const canvasRef = useRef();

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
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('media', mediaPreview.file);
            formData.append('receiverId', userId);

            const { data } = await api.post('/chat/send-media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(pct);
                }
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

    if (!chat) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
    );

    // Use .toString() to ensure comparison works regardless of ID type
    const recipient = chat.members.find(m => m._id?.toString() === userId?.toString()) || { name: 'Vibe User' };

    return (
        <div className="flex flex-col h-screen bg-black text-white relative">
            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-black/60 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[100]">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/chat')} className="p-2 hover:bg-white/5 rounded-2xl text-gray-400">
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${userId}`)}>
                        <div className="relative">
                            <img src={recipient.images?.[0] || 'https://via.placeholder.com/100'} className="w-11 h-11 rounded-2xl object-cover ring-1 ring-white/10" alt="" />
                            {recipient.onlineStatus && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />}
                        </div>
                        <div>
                            <h4 className="font-black text-sm tracking-tight">{recipient.name}</h4>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${isTyping ? 'text-pink-500 animate-pulse' : 'text-gray-500'}`}>
                                {isTyping ? 'Typing...' : (recipient.onlineStatus ? 'Frequency: High' : 'Transmission: Idle')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><Phone size={20} /></button>
                    <button className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><Video size={20} /></button>
                    <button onClick={() => setShowOptions(!showOptions)} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all"><MoreHorizontal size={20} /></button>
                </div>
            </header>

            {/* Inbox Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
                <div className="flex-1" />

                {/* Connection Establised */}
                <div className="flex flex-col items-center py-12 opacity-30">
                    <div className="w-16 h-16 rounded-[2rem] border border-dashed border-white/20 flex items-center justify-center mb-6">
                        <Zap size={24} className="text-gray-500" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Frequency Established</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700 mt-2">Universe: Date2W</p>
                </div>

                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderId?.toString() === user._id?.toString();
                        const isMedia = msg.type === 'image' || msg.type === 'video';

                        return (
                            <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                layout
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`group relative max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} flex items-end gap-2`}>
                                    {!isOwn && (
                                        <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 opacity-60">
                                            <img src={recipient.images?.[0] || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className={`${isMedia ? 'p-1' : 'px-5 py-3.5'} rounded-[1.8rem] glass-card ${isOwn ? 'bg-gradient-to-br from-pink-500 to-purple-700 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-white/90 rounded-tl-none'}`}>
                                        {isMedia ? (
                                            msg.type === 'image' ? (
                                                <img src={msg.mediaUrl} className="max-w-[260px] rounded-[1.5rem] object-cover cursor-pointer hover:brightness-110 transition-all" onClick={() => setLightboxMedia(msg.mediaUrl)} />
                                            ) : (
                                                <div className="relative w-[260px] aspect-video rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center">
                                                    <video src={msg.mediaUrl} className="w-full h-full object-cover opacity-60" />
                                                    <Play className="absolute text-white" fill="white" size={32} />
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-sm font-bold leading-relaxed tracking-tight">{msg.text}</p>
                                        )}
                                        <div className="flex justify-between items-center mt-1 px-1">
                                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-30">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isOwn && <span className="text-[8px] font-black uppercase tracking-tighter text-pink-500/50">{msg.seen ? 'Manifested' : 'Sent'}</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={scrollRef} className="h-4" />
            </div>

            {/* Media Preview Dropzone */}
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="p-4 bg-black/90 backdrop-blur-2xl border-t border-white/5">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl">
                                {mediaPreview.type === 'image' ? <img src={mediaPreview.url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-purple-500/20 flex items-center justify-center"><Film size={20} className="text-purple-400" /></div>}
                                <button onClick={() => setMediaPreview(null)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full"><X size={10} /></button>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black truncate text-white uppercase tracking-widest">{mediaPreview.name}</p>
                                <p className="text-[9px] font-black text-gray-500 mt-1 uppercase">Ready for Transmission</p>
                            </div>
                            <button onClick={handleSendMedia} disabled={uploading} className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-[0_10px_30px_rgba(255,0,128,0.3)]">
                                {uploading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Station */}
            <footer className="p-6 bg-black/80 backdrop-blur-3xl border-t border-white/5 pb-10">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-lg mx-auto">
                    <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} className="w-13 h-13 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-pink-500 transition-all border border-white/5">
                        <Paperclip size={20} />
                    </button>

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[1.8rem] px-5 py-4 focus-within:border-pink-500/40 focus-within:bg-white/10 transition-all">
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
                            placeholder="Type a frequency..."
                            className="w-full bg-transparent outline-none text-sm font-bold resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`w-13 h-13 rounded-full flex items-center justify-center transition-all ${text.trim() ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-700'}`}
                    >
                        <Send size={22} className={text.trim() ? 'translate-x-0.5' : ''} />
                    </button>
                </form>

                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} accept="image/*,video/*" />

                <AnimatePresence>
                    {showAttachMenu && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-28 left-6 bg-neutral-900 border border-white/10 p-2 rounded-3xl shadow-2xl-strong z-50">
                            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl w-full">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><ImageIcon size={18} /></div>
                                <span className="text-xs font-black text-white uppercase tracking-widest">Media</span>
                            </button>
                            <button onClick={() => alert('Camera access requires HTTPS locally')} className="flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl w-full">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center"><Camera size={18} /></div>
                                <span className="text-xs font-black text-white uppercase tracking-widest">Capture</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </footer>
        </div>
    );
}

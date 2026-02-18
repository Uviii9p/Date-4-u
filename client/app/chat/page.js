"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, ChevronRight, Search, Zap, Star, Target, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Chats() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const femalePlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop";
    const malePlaceholder = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop";

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const { data } = await api.get('/chat');
                setChats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchChats();
    }, [user]);

    const getAvatarUrl = (recipient) => {
        if (!recipient?.images?.[0]) return recipient?.gender === 'female' ? femalePlaceholder : malePlaceholder;
        const img = recipient.images[0];
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.1.1.1:5000';
        return `${backendUrl}${img}`;
    };

    const filteredChats = chats.filter(chat => {
        const recipient = chat.members.find(m => m._id !== user?._id);
        return recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full border-2 border-pink-500/20 bg-pink-500/5 flex items-center justify-center mb-8"
                >
                    <MessageSquare size={32} className="text-pink-600 fill-pink-600/20" />
                </motion.div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500/50">Decrypting Transmissions</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6 pb-40">
            {/* Mesh Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-10 left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <header className="relative mb-12 pt-10 z-10">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => router.back()} className="p-3 glass-morphism rounded-2xl text-gray-400 hover:text-white transition-all shadow-xl">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black italic tracking-tighter text-white leading-none"
                        >
                            INNER <span className="gradient-text tracking-normal">CIRCLE</span>
                        </motion.h1>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Active Frequency Streams</p>
                    </div>
                </div>

                {/* Search Bar Pad */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-indigo-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex items-center gap-4 glass-card p-4 pl-8 overflow-hidden bg-black/40 border-white/10 ring-1 ring-white/5 rounded-[2.5rem]">
                        <Search className="text-gray-600 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Identify recipient..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none py-1 font-bold text-white text-md placeholder:text-gray-800"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="p-2 text-gray-500 hover:text-white">
                                <Sparkles size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="relative z-10 space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredChats.map((chat, i) => {
                        const recipient = chat.members.find(m => m._id !== user?._id);
                        const lastMsg = chat.messages?.[chat.messages.length - 1];
                        const isUnread = lastMsg && !lastMsg.seen && lastMsg.senderId !== user?._id;

                        return (
                            <motion.div
                                key={chat._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    href={`/chat/${recipient._id}`}
                                    className={`relative flex items-center gap-5 p-5 glass-card border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all group rounded-[2.2rem] shadow-xl overflow-hidden ${isUnread ? 'ring-2 ring-pink-500/30' : 'ring-1 ring-white/5'}`}
                                >
                                    {isUnread && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                    )}

                                    <div className="relative flex-shrink-0">
                                        <div className="w-18 h-18 rounded-[1.8rem] overflow-hidden border border-white/10 shadow-2xl relative">
                                            <img
                                                src={getAvatarUrl(recipient)}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt=""
                                            />
                                            {isUnread && (
                                                <div className="absolute inset-0 bg-pink-500/10 animate-pulse pointer-events-none" />
                                            )}
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0a0a] shadow-lg ${recipient.onlineStatus ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <h3 className={`text-lg font-black tracking-tight truncate ${isUnread ? 'text-white' : 'text-white/80'}`}>
                                                {recipient.name}
                                            </h3>
                                            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                                {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NEW'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isUnread && <div className="w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]" />}
                                            <p className={`text-sm truncate font-medium tracking-tight ${isUnread ? 'text-pink-400 font-bold' : 'text-gray-500'}`}>
                                                {lastMsg ? (lastMsg.type === 'image' ? 'Sent an attachment' : lastMsg.text) : 'Begin transmission...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white/5 rounded-2xl text-gray-800 group-hover:text-pink-500 transition-all border border-white/5 group-hover:border-pink-500/20 group-hover:bg-pink-500/10">
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredChats.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10"
                    >
                        <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Target size={30} className="text-pink-500/40" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-3 uppercase">Signal Not Found</h2>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] px-12 leading-loose mb-10 mx-auto max-w-sm">
                            The inner circle is empty. Expand your frequency reach to manifest new connections.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(236,72,153,0.2)] hover:scale-105 transition-all text-white border-b-4 border-black/20"
                        >
                            Sync Collective
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

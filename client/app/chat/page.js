"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, ChevronRight, Search } from 'lucide-react';

export default function Chats() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

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
        fetchChats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6 pb-32">
            <header className="mb-10 pt-10">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl font-black italic tracking-tighter text-white mb-2"
                >
                    INNER <span className="gradient-text">CIRCLE</span>
                </motion.h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10">Direct Transmissions</p>

                <div className="relative flex items-center gap-3 glass-morphism p-4 rounded-3xl border-white/5 bg-white/2 ring-1 ring-white/5">
                    <Search className="text-gray-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search collective..."
                        className="bg-transparent border-none outline-none font-bold text-sm w-full p-0 py-1"
                    />
                </div>
            </header>

            <div className="space-y-4">
                <AnimatePresence>
                    {chats.map((chat, i) => {
                        const recipient = chat.members.find(m => m._id !== user._id);
                        const lastMsg = chat.messages?.[chat.messages.length - 1];

                        return (
                            <motion.div
                                key={chat._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/chat/${recipient._id}`}
                                    className="flex items-center gap-4 p-4 glass-card border-white/5 bg-white/2 hover:bg-white/5 transition-all active:scale-98 group"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border border-white/10">
                                            <img
                                                src={recipient.images?.[0] || 'https://via.placeholder.com/200'}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                alt=""
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-black text-white truncate tracking-tight">{recipient.name}</h3>
                                            <span className="text-[9px] font-bold text-gray-600 uppercase">
                                                {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NEW'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate font-medium group-hover:text-gray-300 transition-colors">
                                            {lastMsg ? lastMsg.text : 'Click to manifest conversation...'}
                                        </p>
                                    </div>

                                    <ChevronRight className="text-gray-800 group-hover:text-pink-500 transition-colors" size={20} />
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {chats.length === 0 && (
                    <div className="text-center py-20 bg-white/2 rounded-[2.5rem] border border-dashed border-white/5">
                        <MessageSquare className="text-gray-800 mx-auto mb-6 opacity-20" size={60} />
                        <h2 className="text-xl font-black text-white italic mb-2">The Circle is Silent</h2>
                        <p className="text-gray-500 text-sm font-medium px-10 leading-relaxed mb-10">Start swiping to manifest new direct links and expand your circle.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-primary w-fit mx-auto py-4 px-10 text-[10px]"
                        >
                            Find Frequency
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

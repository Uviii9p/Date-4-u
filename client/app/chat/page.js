"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, Heart, Flame, ImageIcon, Film } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatList() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [chatsRes, matchesRes] = await Promise.all([
                    api.get('/chat'),
                    api.get('/matches')
                ]);
                setChats(chatsRes.data);
                setMatches(matchesRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-6 flex justify-between items-center">
                <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Messages</h1>
                <div className="w-10 h-10 rounded-full border border-pink-500/50 p-0.5">
                    <img src={user?.images?.[0]} className="w-full h-full rounded-full object-cover" />
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search matches or messages"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:bg-white/10 focus:border-pink-500/50 outline-none transition-all"
                    />
                </div>

                {/* New Matches Horizontal Scroll */}
                {matches.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart size={16} className="text-pink-500 fill-pink-500" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-pink-500">New Matches</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {matches.map((match, i) => (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={match._id}
                                >
                                    <Link href={`/chat/${match._id}`} className="flex flex-col items-center gap-2 min-w-[80px]">
                                        <div className="relative p-1 rounded-full border-2 border-pink-500 shadow-[0_0_15px_-3px_rgba(236,72,153,0.5)]">
                                            <div className="w-16 h-16 rounded-full overflow-hidden">
                                                <img src={match.images?.[0]} className="w-full h-full object-cover" />
                                            </div>
                                            {match.onlineStatus && <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full shadow-lg" />}
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-300 truncate w-20 text-center">{match.name.split(' ')[0]}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Message List */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Flame size={16} className="text-orange-500 fill-orange-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-orange-500">Messages</h2>
                    </div>

                    <div className="space-y-2">
                        {chats.map((chat, i) => {
                            const recipient = chat.members.find(m => m._id !== user?._id);
                            const lastMsg = chat.messages[chat.messages.length - 1];
                            const unreadCount = chat.messages.filter(m => !m.seen && m.senderId !== user?._id).length;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={chat._id}
                                >
                                    <Link
                                        href={`/chat/${recipient._id}`}
                                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-white/5 active:scale-[0.98] transition-all group"
                                    >
                                        <div className="relative">
                                            <img
                                                src={recipient.images?.[0]}
                                                className="w-16 h-16 rounded-3xl object-cover ring-2 ring-white/10 group-hover:ring-pink-500/50 transition-all"
                                                alt=""
                                            />
                                            {recipient.onlineStatus && <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-4 border-black rounded-full" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-end mb-1">
                                                <h3 className="font-black text-lg group-hover:text-pink-400 transition-colors">{recipient.name}</h3>
                                                <span className="text-[10px] text-gray-500 font-bold">
                                                    {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-sm truncate pr-4 flex items-center gap-1.5 ${unreadCount > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>
                                                    {lastMsg ? (
                                                        lastMsg.type === 'image' ? (
                                                            <><ImageIcon size={14} className="flex-shrink-0" /> Photo</>
                                                        ) : lastMsg.type === 'video' ? (
                                                            <><Film size={14} className="flex-shrink-0" /> Video</>
                                                        ) : lastMsg.text
                                                    ) : "Matched! Say hello 👋"}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <span className="flex-shrink-0 bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-lg min-w-[20px] text-center shadow-[0_0_10px_rgba(236,72,153,0.5)]">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}

                        {chats.length === 0 && !loading && (
                            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] mt-10 border border-dashed border-white/10">
                                <Heart size={48} className="mx-auto text-gray-700 mb-4" />
                                <h3 className="text-xl font-bold text-gray-400">Your inbox is empty</h3>
                                <p className="text-gray-600 text-sm mt-2 px-10">Matches will appear here once you both swipe right!</p>
                                <Link href="/" className="inline-block mt-8 text-pink-500 font-bold uppercase tracking-widest text-xs hover:underline">
                                    Start Swiping
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageCircle, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Matches() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const { data } = await api.get('/matches');
                setMatches(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="w-12 h-12 border-2 border-pink-500/10 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-6 pb-32">
            <header className="mb-12 pt-10 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-pink-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-pink-500/20 shadow-[0_0_30px_rgba(255,0,128,0.1)]"
                >
                    <Trophy className="text-pink-500" size={32} />
                </motion.div>
                <h1 className="text-5xl font-black tracking-tighter italic text-white mb-2">
                    YOUR <span className="gradient-text">LINKS</span>
                </h1>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Aligned frequencies</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                    {matches.map((match, i) => {
                        const recipient = match.members.find(m => m._id !== user._id);
                        return (
                            <motion.div
                                key={match._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link href={`/chat/${recipient._id}`} className="relative block aspect-[3/4] rounded-[2.5rem] overflow-hidden glass-card border-white/5 active:scale-95 transition-transform group">
                                    <img
                                        src={recipient.images?.[0] || 'https://via.placeholder.com/400'}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        alt={recipient.name}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-500/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                                        <Heart size={14} fill="currentColor" className="text-pink-500" />
                                    </div>

                                    <div className="absolute bottom-5 left-5 right-5 text-white">
                                        <h3 className="text-xl font-black tracking-tight leading-tight truncate mb-1">
                                            {recipient.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Connected</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {matches.length === 0 && (
                <div className="text-center py-20 px-10 glass-card bg-white/2 border-dashed border-white/5 mt-10">
                    <Sparkles size={48} className="text-gray-800 mx-auto mb-6" />
                    <h2 className="text-xl font-black text-white mb-2 italic">Silent Void.</h2>
                    <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed"> No souls have aligned with your universe yet. Keep exploring!</p>
                    <button
                        onClick={() => router.push('/')}
                        className="btn-primary w-full py-4 text-[10px]"
                    >
                        Enter Discovery
                    </button>
                </div>
            )}
        </div>
    );
}

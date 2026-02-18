"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, User, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (searchTerm) => {
        setQuery(searchTerm);
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?query=${searchTerm}`);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black pb-32 text-white">
            <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-2xl px-6 py-8 border-b border-white/5">
                <header className="mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <Sparkles size={16} className="text-pink-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Explore</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tighter"
                    >
                        Find your <span className="gradient-text">Vibe.</span>
                    </motion.h1>
                </header>

                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center">
                        <Search className="absolute left-5 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search names, interests, bios..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl py-5 pl-14 pr-6 outline-none border border-white/10 focus:border-pink-500/50 focus:bg-white/10 transition-all font-bold text-lg placeholder:text-gray-600"
                        />
                        {loading && (
                            <div className="absolute right-5">
                                <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="px-6 py-8">
                <AnimatePresence mode="popLayout">
                    {results.map((profile, idx) => (
                        <motion.div
                            key={profile._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => router.push(`/profile/${profile._id}`)}
                            className="group relative flex items-center gap-5 p-4 mb-4 rounded-[2.5rem] bg-white/5 border border-white/5 transition-all hover:bg-white/10 active:scale-95 cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative w-20 h-20 rounded-[1.75rem] overflow-hidden bg-white/10 border border-white/10">
                                {profile.images?.[0] ? (
                                    <img src={profile.images[0]} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-black text-xl tracking-tight">{profile.name}</h3>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">{profile.age}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium line-clamp-1 mb-2">{profile.bio || "Searching for a vibe..."}</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.interests?.slice(0, 3).map((interest, i) => (
                                        <span key={i} className="text-[9px] font-black uppercase tracking-widest text-pink-500/70">
                                            #{interest}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="relative p-2 rounded-2xl bg-white/5 group-hover:bg-pink-500 transition-colors">
                                <ChevronRight className="text-gray-500 group-hover:text-white" size={24} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && query && results.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Search size={32} className="text-gray-700" />
                        </div>
                        <h2 className="text-xl font-black mb-2">No matches found</h2>
                        <p className="text-gray-500 font-medium">Try searching for different interests or names.</p>
                    </motion.div>
                )}

                {!query && (
                    <div className="text-center py-24">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-12 rounded-full inline-block blur-2xl"
                        />
                        <div className="relative -mt-24">
                            <Search size={64} className="mx-auto mb-6 text-gray-800" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">Start discovering</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search as SearchIcon, MapPin, Sparkles, Filter, SlidersHorizontal, ArrowLeft, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const femalePlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop";
    const malePlaceholder = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop";

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query) handleSearch();
            else setResults([]);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const ProfileCard = ({ profile, i }) => {
        const [imgError, setImgError] = useState(false);

        // Clean the image URL - handle relative paths from local dev
        const getDisplayImg = () => {
            if (imgError || !profile.images?.[0]) {
                return profile.gender === 'female' ? femalePlaceholder : malePlaceholder;
            }
            const img = profile.images[0];
            if (img.startsWith('http')) return img;

            // For local dev /uploads/
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
            return `${backendUrl}${img}`;
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: i * 0.03
                }}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/profile/${profile._id}`)}
                className="relative aspect-[3/4.8] rounded-[2.5rem] overflow-hidden glass-card border-white/5 group bg-white/[0.02] shadow-2xl"
            >
                <img
                    src={getDisplayImg()}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    alt={profile.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                <div className="absolute top-4 right-4 p-1.5 px-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-1">
                    <Zap size={10} className="text-yellow-500" />
                    <span className="text-[7px] font-black uppercase text-white/50 tracking-tighter italic">Lvl {profile.age - 15}</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl font-black tracking-tighter leading-none mb-1 group-hover:text-pink-400 transition-colors truncate">
                        {profile.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{profile.age} YRS • ONLINE</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {profile.interests?.slice(0, 2).map((interest, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[7px] font-black uppercase tracking-widest text-white/70">
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-transparent p-6 pb-40">
            {/* Mesh Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[50%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-[-10%] w-[50%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="relative mb-12 pt-10 z-10">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-3 glass-morphism rounded-2xl text-gray-400 hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl font-black italic tracking-tighter text-white leading-none"
                        >
                            DISCOVER <span className="gradient-text">ENERGY</span>
                        </motion.h1>
                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Scanning Global Collective</p>
                    </div>
                </div>

                {/* Search Bar Pad */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <div className="relative flex items-center gap-4 glass-card p-3 pl-8 overflow-hidden bg-black/40 border-white/10 ring-1 ring-white/5 rounded-[2.5rem]">
                        <SearchIcon className="text-gray-500 group-focus-within:text-pink-500 transition-colors" size={22} />
                        <input
                            type="text"
                            placeholder="Type a name or interest..."
                            className="flex-1 bg-transparent border-none outline-none py-3 font-bold text-white text-lg placeholder:text-gray-800"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all border border-white/5">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 grid grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                    {results.map((profile, i) => (
                        <ProfileCard key={profile._id} profile={profile} i={i} />
                    ))}
                </AnimatePresence>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-14 h-14 border-2 border-pink-500/10 border-t-pink-500 rounded-full animate-spin shadow-[0_0_20px_rgba(236,72,153,0.3)]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/50 animate-pulse">Syncing Frequency</p>
                </div>
            )}

            {!loading && query && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10"
                >
                    <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Target size={32} className="text-pink-500/50" />
                    </div>
                    <p className="text-white font-black text-lg tracking-tight mb-2">Signal Lost</p>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No profiles aligned with this frequency</p>
                </motion.div>
            )}

            {!query && results.length === 0 && (
                <div className="text-center py-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 0.03, scale: 1 }}
                        className="text-[140px] font-black italic tracking-tighter leading-none select-none text-white overflow-hidden whitespace-nowrap"
                    >
                        COLLECTIVE
                    </motion.div>
                </div>
            )}
        </div>
    );
}

"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Search as SearchIcon, MapPin, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.get(`/users/search?q=${query}`);
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

    return (
        <div className="min-h-screen bg-transparent p-6 pb-32">
            <header className="mb-10 pt-10">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl font-black italic tracking-tighter text-white mb-2"
                >
                    DISCOVER <span className="gradient-text">ENERGY</span>
                </motion.h1>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.4em] mb-10">Search by name, interests or vibes</p>

                {/* Search Bar Container */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-[2rem] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-4 glass-card p-2 pl-6 overflow-hidden border-white/10 ring-1 ring-white/5">
                        <SearchIcon className="text-gray-500 group-focus-within:text-pink-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Find your frequency..."
                            className="flex-1 bg-transparent border-none outline-none py-3 font-bold text-white text-lg placeholder:text-gray-700"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {results.map((profile, i) => (
                        <motion.div
                            key={profile._id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/profile/${profile._id}`)}
                            className="relative aspect-[3/4.5] rounded-3xl overflow-hidden glass-card border-white/5 group cursor-pointer"
                        >
                            <img
                                src={profile.images?.[0] || `https://images.unsplash.com/photo-${1500000000000 + (profile.age * 1000000)}?w=400`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt={profile.name}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none" />

                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="text-lg font-black tracking-tight leading-tight mb-1 truncate">
                                    {profile.name}, {profile.age}
                                </h3>
                                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-pink-500 tracking-widest opacity-80 mb-2">
                                    <MapPin size={10} strokeWidth={3} /> {Math.floor(Math.random() * 10) + 1} KM
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {profile.interests?.slice(0, 2).map((interest, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[7px] font-black uppercase tracking-widest">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                </div>
            )}

            {!loading && query && results.length === 0 && (
                <div className="text-center py-20 bg-white/2 rounded-[2rem] border border-dashed border-white/5">
                    <Sparkles size={40} className="text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-sm tracking-tight italic">No signals found in this bandwidth</p>
                </div>
            )}

            {!query && results.length === 0 && (
                <div className="text-center py-20 opacity-30">
                    <h2 className="text-8xl font-black italic tracking-tighter text-white/5 select-none">SEARCH</h2>
                </div>
            )}
        </div>
    );
}

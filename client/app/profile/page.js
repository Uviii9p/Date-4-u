"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Heart, Sparkles, MapPin, ShieldCheck, Edit3, ChevronLeft, ChevronRight, Zap, Target, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [imgIndex, setImgIndex] = useState(0);
    const [imgError, setImgError] = useState(false);

    const femalePlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop";
    const malePlaceholder = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop";

    if (!user) return null;

    const nextImg = () => {
        if (user.images?.length > 1) {
            setImgIndex((prev) => (prev + 1) % user.images.length);
            setImgError(false);
        }
    };

    const prevImg = () => {
        if (user.images?.length > 1) {
            setImgIndex((prev) => (prev - 1 + user.images.length) % user.images.length);
            setImgError(false);
        }
    };

    const getProfileImg = () => {
        if (imgError || !user.images?.[imgIndex]) {
            return user.gender === 'female' ? femalePlaceholder : malePlaceholder;
        }
        const img = user.images[imgIndex];
        // Handle full URLs (Unsplash, Cloudinary, etc)
        if (img.startsWith('http')) return img;
        // Handle Base64 strings
        if (img.startsWith('data:')) return img;
        // Handle relative paths (Local uploads)
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.1.1.1:5000').replace(/\/$/, '');
        const cleanImg = img.startsWith('/') ? img : `/${img}`;
        return `${backendUrl}${cleanImg}`;
    };

    return (
        <div className="min-h-screen bg-transparent p-6 pb-40">
            {/* Mesh Background for Profile */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-96 h-96 bg-pink-500/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
            </div>

            <header className="relative flex justify-between items-center mb-12 pt-10 z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                        MY <br />
                        <span className="gradient-text tracking-normal">IDENTITY</span>
                    </h1>
                </motion.div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.push('/settings')}
                        className="p-4 glass-morphism rounded-[1.5rem] text-gray-400 hover:text-white transition-all shadow-xl"
                    >
                        <Settings size={22} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={logout}
                        className="p-4 glass-morphism rounded-[1.5rem] text-red-500 hover:bg-red-500/10 transition-all shadow-xl"
                    >
                        <LogOut size={22} />
                    </motion.button>
                </div>
            </header>

            {/* Profile Digital ID Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative glass-card overflow-hidden mb-12 p-2 bg-white/[0.03] ring-1 ring-white/10 group shadow-[0_50px_100px_rgba(0,0,0,0.4)]"
            >
                {/* Horizontal Progress bar for images */}
                {user.images?.length > 1 && (
                    <div className="absolute top-6 inset-x-10 flex gap-2 z-30">
                        {user.images.map((_, i) => (
                            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    initial={false}
                                    animate={{ opacity: i === imgIndex ? 1 : 0 }}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative aspect-[3/4.2] rounded-[2.8rem] overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={imgIndex}
                            src={getProfileImg()}
                            onError={() => setImgError(true)}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.6 }}
                            className="w-full h-full object-cover"
                            alt={user.name}
                        />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/98 via-black/20 to-transparent" />

                    {/* Image Navigation Controls */}
                    {user.images?.length > 1 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={prevImg} className="p-3 glass-morphism rounded-full text-white/50 hover:text-white"><ChevronLeft /></button>
                            <button onClick={nextImg} className="p-3 glass-morphism rounded-full text-white/50 hover:text-white"><ChevronRight /></button>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => router.push('/profile/edit')}
                        className="absolute top-8 right-8 p-5 bg-white backdrop-blur-3xl text-black rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-40"
                    >
                        <Edit3 size={24} />
                    </motion.button>

                    <div className="absolute bottom-10 left-10 right-10">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-5xl font-black text-white tracking-tight">{user.name}, {user.age}</h2>
                            <div className="p-1 px-3 bg-blue-500/20 rounded-full border border-blue-500/30 flex items-center gap-1">
                                <ShieldCheck size={16} className="text-blue-400" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Verified</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 font-bold mb-8">
                            <div className="flex items-center gap-1.5 px-3 py-1 glass-morphism rounded-xl">
                                <MapPin size={16} className="text-pink-500" />
                                <span className="text-[11px] uppercase tracking-wider text-white/80">Frequency: High</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 glass-morphism rounded-xl">
                                <Zap size={16} className="text-yellow-500 animate-pulse" />
                                <span className="text-[11px] uppercase tracking-wider text-white/80">Active</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user.interests?.slice(0, 4).map((interest, i) => (
                                <span key={i} className="px-5 py-2 glass-morphism rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white/90 border-white/5 shadow-lg">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Performance Metrics Section */}
            <div className="grid grid-cols-3 gap-4 mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 border-white/5 text-center bg-white/[0.02] flex flex-col items-center justify-center ring-1 ring-white/5"
                >
                    <Heart className="text-pink-500 mb-3" size={20} fill="currentColor" />
                    <p className="text-2xl font-black text-white tracking-tighter">184</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Adored</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 border-white/5 text-center bg-white/[0.02] flex flex-col items-center justify-center ring-1 ring-white/5"
                >
                    <Target className="text-blue-400 mb-3" size={20} />
                    <p className="text-2xl font-black text-white tracking-tighter">92%</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Match</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 border-white/5 text-center bg-white/[0.02] flex flex-col items-center justify-center ring-1 ring-white/5"
                >
                    <Star className="text-yellow-500 mb-3" size={20} fill="currentColor" />
                    <p className="text-2xl font-black text-white tracking-tighter">4.9</p>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Vibe</p>
                </motion.div>
            </div>

            {/* Identity Transmission Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-10 bg-black/40 border-white/10 relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={60} strokeWidth={3} className="text-white" />
                </div>

                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500 mb-6 flex items-center gap-3">
                        <div className="w-8 h-[2px] bg-pink-500" /> Transmission
                    </h3>
                    <p className="text-white/80 text-lg font-medium leading-[1.6] italic tracking-tight mb-8">
                        "{user.bio || "No transmission sequence initialized. Update your bio to let the collective align with your frequency."}"
                    </p>

                    <button
                        onClick={() => router.push('/profile/edit')}
                        className="px-6 py-3 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all ring-1 ring-white/10 hover:ring-white/30"
                    >
                        Re-Initialize Bio
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

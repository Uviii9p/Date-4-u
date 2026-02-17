"use client";
import { useAuth } from '@/context/AuthContext';
import { Settings, Edit2, LogOut, Shield, CreditCard, ChevronRight, Heart, MapPin, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
            {/* Header Profile Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                    src={user.images?.[0] || 'https://via.placeholder.com/800'}
                    className="w-full h-full object-cover"
                    alt={user.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/20" />

                <div className="absolute bottom-8 left-8 right-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black tracking-tighter">{user.name}, {user.age}</h1>
                            <div className="p-1 px-3 bg-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                                Verify
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="text-pink-500" />
                                <span>{user.location?.name || 'San Francisco, CA'}</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-700 rounded-full" />
                            <div className="flex items-center gap-1">
                                <UserIcon size={16} className="text-purple-500" />
                                <span className="capitalize">{user.gender}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Action Grid */}
            <div className="px-6 -mt-10 relative z-10 grid grid-cols-3 gap-3">
                <button
                    onClick={() => router.push('/profile/edit')}
                    className="flex flex-col items-center justify-center gap-2 p-6 glass-card border-white/10 hover:bg-white/5 transition-all"
                >
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 ring-1 ring-white/10">
                        <Edit2 size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Edit</span>
                </button>

                <button className="flex flex-col items-center justify-center gap-2 p-6 glass-card border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-transparent">
                    <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 ring-1 ring-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                        <CreditCard size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Gold</span>
                </button>

                <button
                    onClick={() => router.push('/settings')}
                    className="flex flex-col items-center justify-center gap-2 p-6 glass-card border-white/10 hover:bg-white/5 transition-all w-full"
                >
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 ring-1 ring-white/10">
                        <Settings size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Settings</span>
                </button>
            </div>

            {/* Details Sections */}
            <div className="p-6 space-y-8 mt-4">

                {/* Bio */}
                <section className="glass-card p-6 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                        <Heart size={14} className="text-pink-500" /> Bio
                    </h3>
                    <p className="text-gray-200 leading-relaxed font-medium">
                        {user.bio || "No bio yet. Tap edit to tell everyone about yourself!"}
                    </p>
                </section>

                {/* Interests */}
                <section className="glass-card p-6 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.interests?.map(interest => (
                            <span key={interest} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
                                {interest}
                            </span>
                        )) || <p className="text-gray-500 italic text-sm">None added</p>}
                    </div>
                </section>

                {/* Menu List */}
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-5 glass-card border-white/5 hover:bg-white/5 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Shield size={20} />
                            </div>
                            <span className="font-bold">Safety Center</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-between p-5 glass-card border-red-500/10 hover:bg-red-500/5 transition-all group"
                    >
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            <span className="font-black">Logout</span>
                        </div>
                    </button>
                </div>

                <div className="text-center py-10 opacity-20">
                    <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Date2W</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Version 2026.12.02</p>
                </div>
            </div>
        </div>
    );
}

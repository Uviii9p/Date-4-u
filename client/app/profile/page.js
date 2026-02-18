"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, Heart, Sparkles, MapPin, ShieldCheck, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-transparent p-6 pb-32">
            <header className="flex justify-between items-center mb-10 pt-10">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-black italic tracking-tighter text-white"
                >
                    MY <span className="gradient-text">IDENTITY</span>
                </motion.h1>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/settings')} className="p-3 glass-morphism rounded-2xl text-gray-400 hover:text-white transition-all">
                        <Settings size={20} />
                    </button>
                    <button onClick={logout} className="p-3 glass-morphism rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden mb-10 p-1 bg-white/5 ring-1 ring-white/10"
            >
                <div className="relative aspect-[4/5] rounded-[2.2rem] overflow-hidden">
                    <img
                        src={user.images?.[0] || 'https://via.placeholder.com/600'}
                        className="w-full h-full object-cover"
                        alt={user.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                    <button
                        onClick={() => router.push('/profile/edit')}
                        className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl hover:bg-white/20 transition-all"
                    >
                        <Edit3 size={20} />
                    </button>

                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-white tracking-tighter">{user.name}, {user.age}</h2>
                            <ShieldCheck size={24} className="text-blue-400" />
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-6">
                            <MapPin size={16} className="text-pink-500" />
                            <span>Frequency: Online</span>
                        </div>

                        <div className="flex gap-2">
                            {user.interests?.slice(0, 3).map((interest, i) => (
                                <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="glass-card p-6 border-white/5 text-center bg-pink-500/5 ring-1 ring-pink-500/10">
                    <Heart className="text-pink-500 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-black text-white tracking-tighter">0</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Adored by</p>
                </div>
                <div className="glass-card p-6 border-white/5 text-center bg-purple-500/5 ring-1 ring-purple-500/10">
                    <Sparkles className="text-purple-500 mx-auto mb-2" size={24} />
                    <p className="text-2xl font-black text-white tracking-tighter">100%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Integrity</p>
                </div>
            </div>

            {/* Bio Section */}
            <div className="glass-card p-8 bg-white/2 border-white/5 border-dashed">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-4 px-1">Transmission</h3>
                <p className="text-white/80 font-medium italic leading-relaxed">
                    {user.bio || "No transmission set. Update your bio to let the collective know who you are."}
                </p>
            </div>
        </div>
    );
}

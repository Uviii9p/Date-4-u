"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ChevronLeft, MapPin, User as UserIcon, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicProfile({ params }) {
    // In React 19 / Next.js 15+, params is a promise.
    // However, depending on Next.js version (this is 16.1.6 according to package.json), 
    // waiting for params is required if it's passed as prop, OR we can use useParams hook which is safer for client components.
    // Let's use useParams() from next/navigation (or react-router logic, but in Next App router useParams exists)
    // Actually next/navigation has useParams.

    // params prop in client component:
    // "params" is a Promise in Next.js 15+ for Server Components, but this is a Client Component ("use client").
    // Safest bet in recent Next.js for Client Components is `useParams` from `next/navigation`.

    // Wait, `useParams` returns an object.

    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProfile = async () => {
            try {
                const { data } = await api.get(`/users/${id}`);
                setProfile(data);
            } catch (err) {
                console.error(err);
                // Redirect to search or show error if not found
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const [isMatched, setIsMatched] = useState(false);

    useEffect(() => {
        if (currentUser?.matches?.includes(id)) {
            setIsMatched(true);
        }
    }, [currentUser, id]);

    const handleLike = async () => {
        try {
            const { data } = await api.post('/matches/swipe', {
                targetUserId: id,
                direction: 'like'
            });
            if (data.match) {
                setIsMatched(true);
                alert("It's a Match! You can now message them.");
            } else {
                alert("Liked! If they like you back, it's a match.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    const handleMessage = () => {
        router.push(`/chat/${id}`);
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
                <h2 className="text-xl font-bold mb-4">User not found</h2>
                <button onClick={() => router.back()} className="text-pink-500 text-sm font-bold uppercase tracking-widest">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
            {/* Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white shadow-lg"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            {/* Profile Hero */}
            <div className="relative h-[60vh] overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    src={profile.images?.[0] || 'https://via.placeholder.com/800'}
                    className="w-full h-full object-cover"
                    alt={profile.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/20" />

                <div className="absolute bottom-8 left-8 right-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black tracking-tighter">{profile.name}, {profile.age}</h1>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                            <div className="flex items-center gap-1">
                                <UserIcon size={16} className="text-purple-500" />
                                <span className="capitalize">{profile.gender}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Details */}
            <div className="px-6 -mt-6 relative z-10 space-y-6">

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleLike}
                        className="py-4 rounded-xl bg-pink-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-pink-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Heart size={18} fill="currentColor" /> Like
                    </button>
                    <button
                        onClick={handleMessage}
                        className="py-4 rounded-xl font-black uppercase tracking-widest text-xs border active:scale-95 transition-transform flex items-center justify-center gap-2 bg-white/10 text-white border-white/10 hover:bg-white/20"
                    >
                        <MessageSquare size={18} /> Message
                    </button>
                </div>

                {/* Bio */}
                <section className="glass-card p-6 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                        About
                    </h3>
                    <p className="text-gray-200 leading-relaxed font-medium">
                        {profile.bio || "No bio yet."}
                    </p>
                </section>

                {/* Interests */}
                <section className="glass-card p-6 border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.interests?.map(interest => (
                            <span key={interest} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
                                {interest}
                            </span>
                        )) || <p className="text-gray-500 italic text-sm">None added</p>}
                    </div>
                </section>
            </div>
        </div>
    );
}

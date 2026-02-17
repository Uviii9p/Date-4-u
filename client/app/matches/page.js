"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Matches() {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

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
        if (user) fetchMatches();
    }, [user]);

    if (loading) return null;

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
                <Heart className="text-pink-500 fill-pink-500" />
                <h1 className="text-3xl font-bold">New Matches</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {matches.map(match => (
                    <Link key={match._id} href={`/chat/${match._id}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card group">
                        <img src={match.images?.[0]} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-3 left-3">
                            <p className="font-bold text-lg">{match.name}</p>
                            <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${match.onlineStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                <span className="text-[10px] text-gray-300">{match.onlineStatus ? 'Active now' : 'Recently active'}</span>
                            </div>
                        </div>
                    </Link>
                ))}

                {matches.length === 0 && (
                    <div className="col-span-2 text-center mt-20 text-gray-400">
                        <div className="w-20 h-20 bg-white bg-opacity-5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} />
                        </div>
                        <p>No matches yet. Keep swiping!</p>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h3 className="text-lg font-bold mb-4">Daily Standouts</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {matches.slice(0, 3).map(m => (
                        <div key={m._id} className="min-w-[120px] aspect-square rounded-full border-2 border-pink-500 p-1">
                            <img src={m.images?.[0]} className="w-full h-full rounded-full object-cover" alt="" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

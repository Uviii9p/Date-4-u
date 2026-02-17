"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <div className="min-h-screen bg-[#0A0A0A] pb-24 text-white">
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl p-4 border-b border-white/5">
                <h1 className="text-xl font-black italic tracking-tighter mb-4">Find People</h1>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full bg-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/10 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {results.map((profile) => (
                    <motion.div
                        key={profile._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => router.push(`/profile/${profile._id}`)} // Need to implement public profile view
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 active:scale-95 transition-all cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                            {profile.images?.[0] ? (
                                <img src={profile.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm">{profile.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{profile.bio || 'No bio yet'}</p>
                        </div>
                        <ChevronRight className="text-gray-600" size={20} />
                    </motion.div>
                ))}

                {!loading && query && results.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p className="text-xs font-black uppercase tracking-widest">No users found</p>
                    </div>
                )}

                {!query && (
                    <div className="text-center py-20 text-gray-600 opacity-50">
                        <Search size={48} className="mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Type to search</p>
                    </div>
                )}
            </div>
        </div>
    );
}

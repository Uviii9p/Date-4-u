"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#050505] relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#000_100%)] opacity-50"></div>
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-pink-500/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full animate-pulse shadow-2xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full glass-card p-10 flex flex-col shadow-2xl border border-white/5 z-10"
            >
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        DATE2W
                    </h1>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-10 opacity-60">Digital Era Connection</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            placeholder="aria@date2w.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em] mt-6 flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.3)] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-400">
                    New here? <Link href="/register" className="text-pink-400 font-bold hover:underline">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
}

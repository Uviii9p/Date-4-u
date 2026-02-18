"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, Sparkles, ArrowRight } from 'lucide-react';

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
            console.error('Login Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Login failed.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_40%,#111_0%,#000_100%)]"></div>
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-pink-500/10 blur-[130px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full animate-pulse shadow-2xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative w-full max-w-sm glass-card p-10 flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.8)] border-white/5 z-10"
            >
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10"
                    >
                        <Sparkles className="text-pink-500" size={32} />
                    </motion.div>
                    <h1 className="text-5xl font-black mb-2 tracking-tighter italic gradient-text">
                        DATE2W
                    </h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Syncing Souls</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Access Channel</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm placeholder:text-gray-700"
                            placeholder="Email Address"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 px-1">Identity Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm placeholder:text-gray-700"
                            placeholder="Password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] mt-10 shadow-[0_15px_40px_rgba(255,0,128,0.2)] disabled:opacity-50 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                Initialize Link <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-xs font-bold mb-2">New to this timeline?</p>
                    <Link href="/register" className="text-white font-black uppercase tracking-widest text-[10px] hover:text-pink-500 transition-colors border-b border-white/10 pb-1">Create Universe</Link>
                </div>
            </motion.div>
        </div>
    );
}

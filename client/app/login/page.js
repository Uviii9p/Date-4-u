"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full glass-card p-10 flex flex-col shadow-2xl"
            >
                <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Welcome Back</h1>
                <p className="text-gray-300 mb-8">Sign in to find your 2026 spark.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white bg-opacity-5 rounded-xl py-4 px-6 border border-white border-opacity-10 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white bg-opacity-5 rounded-xl py-4 px-6 border border-white border-opacity-10 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-4 text-lg mt-4 shadow-pink-500/20">
                        Sign In
                    </button>
                </form>

                <p className="text-center mt-8 text-gray-400">
                    New here? <Link href="/register" className="text-pink-400 font-bold hover:underline">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
}

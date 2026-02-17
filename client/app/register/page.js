"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: 'male'
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (parseInt(formData.age) < 18) {
                alert("You must be 18+ to use this app");
                setLoading(false);
                return;
            }
            await register(formData);
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed. Check if backend is running.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A0A0A] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-pink-500/10 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-purple-600/10 blur-[100px] rounded-full -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-10 flex flex-col shadow-2xl relative z-10 border-white/5"
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-black mb-2 tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        DATE2W
                    </h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Create your universe</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Aria Smith"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Email</label>
                        <input
                            type="email"
                            placeholder="aria@date2w.com"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Age</label>
                            <input
                                type="number"
                                placeholder="18"
                                className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Gender</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm appearance-none"
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="male" className="bg-neutral-900">Male</option>
                                    <option value="female" className="bg-neutral-900">Female</option>
                                    <option value="other" className="bg-neutral-900">Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-xs font-black uppercase tracking-[0.3em] mt-6 flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.3)]"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Create Universe'}
                    </button>
                </form>

                <p className="text-center mt-10 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    Already a member? <Link href="/login" className="text-pink-500 hover:text-pink-400 transition-colors">Join In</Link>
                </p>
            </motion.div>
        </div>
    );
}

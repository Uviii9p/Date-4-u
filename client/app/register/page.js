"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, MapPin, Orbit } from 'lucide-react';

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
                alert("Age 18+ required for alignment.");
                setLoading(false);
                return;
            }
            await register(formData);
        } catch (err) {
            console.error('Registration Error:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Registration failed.';
            alert(`Signal Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-y-auto">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-pink-500/10 blur-[130px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-purple-600/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm glass-card p-10 flex flex-col shadow-2xl relative z-10 border-white/5 my-10"
            >
                <div className="mb-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10"
                    >
                        <UserPlus className="text-pink-500" size={28} />
                    </motion.div>
                    <h1 className="text-5xl font-black mb-1 tracking-tighter italic gradient-text">
                        DATE2W
                    </h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Join the Collective</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Display Name</label>
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Signal Address</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Security Key</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Age</label>
                            <input
                                type="number"
                                placeholder="18"
                                className="w-full bg-white/5 rounded-2xl py-4 px-6 border border-white/10 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm"
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Entity</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-neutral-900 rounded-2xl py-4 px-6 border border-white/5 focus:border-pink-500/50 focus:bg-white/10 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">▼</div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] mt-8 flex items-center justify-center shadow-[0_15px_40px_rgba(255,0,128,0.2)]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Manifest Identity'}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-xs font-bold mb-2">Already manifest?</p>
                    <Link href="/login" className="text-white font-black uppercase tracking-widest text-[10px] hover:text-pink-500 transition-colors border-b border-white/10 pb-1">Enter Portal</Link>
                </div>
            </motion.div>
        </div>
    );
}

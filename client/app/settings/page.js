"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ChevronLeft, Bell, Lock, Globe, Moon, User, LogOut, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const { user, setUser, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGenderPreferenceChange = async (preference) => {
        setLoading(true);
        try {
            const { data } = await api.put('/users/profile', { genderPreference: preference });
            setUser(data);
        } catch (err) {
            console.error(err);
            alert('Failed to update preference');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-widest">Settings</h1>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="p-6 space-y-8">
                {/* Account Section */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Account</h3>
                    <div className="space-y-1">
                        <div className="glass-card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-gray-300">
                                <User size={18} />
                                <span className="text-sm font-bold">Email</span>
                            </div>
                            <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                        </div>
                        <div className="glass-card p-4 flex items-center justify-between cursor-pointer active:bg-white/5 transition-colors"
                            onClick={() => {
                                navigator.clipboard.writeText(user._id);
                                alert('User ID Copied!');
                            }}>
                            <div className="flex items-center gap-3 text-gray-300">
                                <Globe size={18} />
                                <span className="text-sm font-bold">My ID</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono truncate max-w-[150px]">{user._id}</span>
                        </div>
                        <button className="w-full glass-card p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Lock size={18} />
                                <span className="text-sm font-bold">Change Password</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>

                {/* Discovery Section */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">Discovery</h3>
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center gap-3 text-gray-300 mb-2">
                            <Globe size={18} />
                            <span className="text-sm font-bold">Show Me</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {['male', 'female', 'both'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleGenderPreferenceChange(option)}
                                    disabled={loading}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${user.genderPreference === option
                                        ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20'
                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {option === 'both' ? 'Everyone' : option}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 italic text-center">
                            This controls who you see in Discover.
                        </p>
                    </div>
                </section>

                {/* App Settings */}
                <section>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4 px-2">App Settings</h3>
                    <div className="space-y-1">
                        <div className="glass-card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Bell size={18} />
                                <span className="text-sm font-bold">Notifications</span>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                            </div>
                        </div>
                        <div className="glass-card p-4 flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Moon size={18} />
                                <span className="text-sm font-bold">Dark Mode</span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">Always On</span>
                        </div>
                    </div>
                </section>

                <button
                    onClick={logout}
                    className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                >
                    <LogOut size={16} /> Log Out
                </button>

                <div className="text-center pt-8 pb-4">
                    <p className="text-[10px] text-gray-600 font-mono">Build 2026.12.02-alpha</p>
                </div>
            </div>
        </div>
    );
}

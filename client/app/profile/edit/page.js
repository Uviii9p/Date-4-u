"use client";
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Camera, X, Plus, ChevronLeft, Check, Trash2, Shield, Info, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfile() {
    const { user, setUser } = useAuth();
    const router = useRouter();

    // We store the current state of images. 
    // Items can be: { type: 'existing', url: string } or { type: 'new', file: File, preview: string }
    const [imageSlots, setImageSlots] = useState(() => {
        const slots = (user?.images || []).map(img => ({ type: 'existing', url: img }));
        // Fill up to 6 slots
        return slots;
    });

    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        age: user?.age || '',
        gender: user?.gender || 'male',
        genderPreference: user?.genderPreference || 'both',
        interests: user?.interests?.join(', ') || ''
    });

    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const newSlots = [...imageSlots];

        selectedFiles.forEach(file => {
            if (newSlots.length < 6) {
                newSlots.push({
                    type: 'new',
                    file: file,
                    preview: URL.createObjectURL(file)
                });
            }
        });

        setImageSlots(newSlots);
    };

    const removeImage = (index) => {
        const newSlots = [...imageSlots];
        newSlots.splice(index, 1);
        setImageSlots(newSlots);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('bio', formData.bio);
        data.append('age', formData.age);
        data.append('gender', formData.gender);
        data.append('genderPreference', formData.genderPreference);
        data.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim()).filter(i => i)));

        // Send images in order
        // We append them as 'images'. The backend getAll('images') will get them.
        imageSlots.forEach(slot => {
            if (slot.type === 'existing') {
                data.append('images', slot.url);
            } else {
                data.append('images', slot.file);
            }
        });

        try {
            const response = await api.put('/users/profile', data);
            setUser(response.data);
            router.push('/profile');
        } catch (err) {
            console.error('Update profile error:', err);
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const getImgSrc = (slot) => {
        if (slot.type === 'existing') {
            if (slot.url.startsWith('http') || slot.url.startsWith('data:')) return slot.url;
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
            return `${backendUrl}${slot.url}`;
        }
        return slot.preview;
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-20%] w-[60%] h-[50%] bg-pink-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-[-20%] w-[60%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-3xl border-b border-white/5 p-6 flex justify-between items-center px-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 glass-morphism rounded-2xl text-gray-400 hover:text-white transition-all">
                        <ChevronLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tighter leading-none">RE-INITIALIZE</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-pink-500 mt-1">Identity Modification</p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl disabled:opacity-50 transition-all"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <Check size={16} strokeWidth={3} />
                            <span>Synchronize</span>
                        </>
                    )}
                </motion.button>
            </header>

            <div className="relative z-10 p-8 pb-40 max-w-2xl mx-auto space-y-12">
                <section>
                    <div className="flex items-center justify-between mb-8 px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Visual Data Points</h3>
                        <span className="text-[9px] font-black text-white/30 uppercase">{imageSlots.length} / 6 Captured</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    layout
                                    className="relative aspect-[3/4] rounded-[2rem] overflow-hidden glass-card border-white/5 bg-white/[0.02] group ring-1 ring-white/5"
                                >
                                    {imageSlots[i] ? (
                                        <>
                                            <img src={getImgSrc(imageSlots[i])} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <button
                                                type="button"
                                                className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-xl rounded-2xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                onClick={() => removeImage(i)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-xl text-[7px] font-black uppercase text-white/50 tracking-widest border border-white/10">
                                                Slot {i + 1}
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all group">
                                            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex items-center justify-center group-hover:border-pink-500/50 group-hover:bg-pink-500/5 transition-all">
                                                <Plus size={20} className="text-gray-600 group-hover:text-pink-500" />
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-700 mt-4">Initialize</span>
                                            <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        </label>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Alias / Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/[0.03] rounded-2xl p-5 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold ring-1 ring-white/5"
                                    placeholder="Identity Label"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Cycles / Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full bg-white/[0.03] rounded-2xl p-5 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold ring-1 ring-white/5"
                                    placeholder="18+"
                                    min="18"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Transmission Sequence (Bio)</label>
                                <span className={`${formData.bio.length > 150 ? 'text-pink-500' : 'text-gray-700'} text-[8px] font-black`}>{formData.bio.length} / 250</span>
                            </div>
                            <textarea
                                value={formData.bio}
                                maxLength={250}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-white/[0.03] rounded-[2rem] p-6 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/[0.06] transition-all h-40 resize-none font-medium leading-relaxed text-white/80 italic ring-1 ring-white/5"
                                placeholder="Broadcast your frequency to the collective..."
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Alignment Markers (Interests)</label>
                            <input
                                type="text"
                                value={formData.interests}
                                onChange={e => setFormData({ ...formData, interests: e.target.value })}
                                className="w-full bg-white/[0.03] rounded-2xl p-5 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/[0.06] transition-all text-sm font-bold ring-1 ring-white/5"
                                placeholder="Coding, Travel, Techno, Sci-Fi..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Self Calibration</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    className="w-full bg-white/[0.03] rounded-2xl p-5 pr-12 outline-none border border-white/5 appearance-none font-bold text-sm focus:border-pink-500/50 transition-all ring-1 ring-white/5"
                                >
                                    <option value="male" className="bg-neutral-950">Male Core</option>
                                    <option value="female" className="bg-neutral-950">Female Core</option>
                                    <option value="other" className="bg-neutral-950">Hybrid / Other</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 px-2">Target Alignment</label>
                                <select
                                    value={formData.genderPreference}
                                    onChange={e => setFormData({ ...formData, genderPreference: e.target.value })}
                                    className="w-full bg-white/[0.03] rounded-2xl p-5 pr-12 outline-none border border-white/5 appearance-none font-bold text-sm focus:border-pink-500/50 transition-all ring-1 ring-white/5"
                                >
                                    <option value="male" className="bg-neutral-950">Male Frequency</option>
                                    <option value="female" className="bg-neutral-950">Female Frequency</option>
                                    <option value="both" className="bg-neutral-950">Multichannel (Everyone)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 bg-white/[0.01] border-white/5 rounded-[2.5rem] flex items-center justify-between">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                                <Sparkles size={18} className="text-pink-500" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Ready to <br />Broadcast?</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(236,72,153,0.2)] hover:scale-105 transition-all text-white"
                        >
                            Sync Identity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

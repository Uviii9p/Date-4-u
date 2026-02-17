"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Camera, X, Plus, ChevronLeft, Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditProfile() {
    const { user, setUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        age: user?.age || '',
        gender: user?.gender || 'male',
        genderPreference: user?.genderPreference || 'both',
        interests: user?.interests?.join(', ') || ''
    });
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState(user?.images || []);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);

        // Also remove from files if it was a new upload
        // For existing images, we'd ideally send the updated list to backend
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('bio', formData.bio);
        data.append('age', formData.age);
        data.append('gender', formData.gender);
        data.append('genderPreference', formData.genderPreference);
        data.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim()).filter(i => i)));

        files.forEach(file => {
            data.append('images', file);
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

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Navbar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-sm font-black uppercase tracking-widest">Edit Profile</h1>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="p-2 text-pink-500 hover:bg-pink-500/10 rounded-full transition-colors"
                >
                    {loading ? <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /> : <Check size={24} />}
                </button>
            </div>

            <div className="p-6 pb-32 max-w-2xl mx-auto space-y-10">

                {/* Media Section */}
                <section>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 px-1">Profile Photos</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-card border-white/5 bg-white/5 group">
                                {previews[i] ? (
                                    <>
                                        <img src={previews[i]} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={() => removeImage(i)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black uppercase">
                                            Photo {i + 1}
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                        <div className="flex flex-col items-center gap-2">
                                            <Plus size={24} className="text-pink-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Add</span>
                                        </div>
                                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-4 text-center font-bold italic">Hold and drag to reorder (Coming Soon)</p>
                </section>

                {/* Basic Info */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block px-1">About Me</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-white/5 rounded-3xl p-5 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/10 transition-all h-32 resize-none font-medium leading-relaxed"
                                placeholder="Tell them something they won't find on your Instagram..."
                            />
                        </div>

                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block px-1 transition-colors group-focus-within:text-pink-500">My Interests</label>
                            <input
                                type="text"
                                value={formData.interests}
                                onChange={e => setFormData({ ...formData, interests: e.target.value })}
                                className="w-full bg-white/5 rounded-2xl p-4 outline-none border border-white/5 focus:border-pink-500/50 focus:bg-white/10 transition-all text-sm font-bold"
                                placeholder="Ex: Travel, Coffee, Coding..."
                            />
                            <p className="text-[9px] text-gray-600 mt-2 italic px-1">Separate with commas</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block px-1">Gender</label>
                                <div className="relative">
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-white/5 rounded-2xl p-4 pr-10 outline-none border border-white/5 appearance-none font-bold text-sm focus:border-pink-500/50"
                                    >
                                        <option value="male" className="bg-neutral-900">Male</option>
                                        <option value="female" className="bg-neutral-900">Female</option>
                                        <option value="other" className="bg-neutral-900">Other</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-3 block px-1">Looking for</label>
                                <div className="relative">
                                    <select
                                        value={formData.genderPreference}
                                        onChange={e => setFormData({ ...formData, genderPreference: e.target.value })}
                                        className="w-full bg-white/5 rounded-2xl p-4 pr-10 outline-none border border-white/5 appearance-none font-bold text-sm focus:border-pink-500/50"
                                    >
                                        <option value="male" className="bg-neutral-900">Men</option>
                                        <option value="female" className="bg-neutral-900">Women</option>
                                        <option value="both" className="bg-neutral-900">Everyone</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 btn-primary text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(236,72,153,0.3)] mt-8"
                    >
                        {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}

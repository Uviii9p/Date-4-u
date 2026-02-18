"use client";
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, Info, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

const SwipeCard = ({ user, onSwipe, isTop }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imgError, setImgError] = useState(false);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -250, 0, 250, 300], [0, 1, 1, 1, 0]);

    const likeScale = useTransform(x, [0, 150], [0.8, 1.2]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeScale = useTransform(x, [0, -150], [0.8, 1.2]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (event, info) => {
        if (!isTop) return;
        if (info.offset.x > 120) {
            onSwipe('right', user._id);
        } else if (info.offset.x < -120) {
            onSwipe('left', user._id);
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (currentImgIndex < (user.images?.length || 1) - 1) {
            setCurrentImgIndex(prev => prev + 1);
            setImgError(false);
        } else {
            setCurrentImgIndex(0);
            setImgError(false);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (currentImgIndex > 0) {
            setCurrentImgIndex(prev => prev - 1);
            setImgError(false);
        }
    };

    const femalePlaceholder = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop";
    const malePlaceholder = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop";
    const fallbackImage = user.gender === 'female' ? femalePlaceholder : malePlaceholder;

    const getDisplayImg = () => {
        if (imgError || !user.images?.[currentImgIndex]) {
            return fallbackImage;
        }
        const img = user.images[currentImgIndex];
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.1.1.1:5000').replace(/\/$/, '');
        const cleanImg = img.startsWith('/') ? img : `/${img}`;
        return `${backendUrl}${cleanImg}`;
    };

    return (
        <motion.div
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity, zIndex: isTop ? 50 : 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1 }}
            exit={{
                x: x.get() > 0 ? 1000 : x.get() < 0 ? -1000 : 0,
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.4 }
            }}
            className="absolute inset-x-0 top-0 h-[60vh] w-full max-w-[400px] mx-auto cursor-grab active:cursor-grabbing select-none"
        >
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden bg-neutral-900 shadow-[0_20px_40px_rgba(0,0,0,0.6)] group border border-white/5">
                <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImgIndex}
                            src={getDisplayImg()}
                            onError={() => setImgError(true)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt={user.name}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                </div>

                <div className="absolute top-4 inset-x-6 flex gap-1.5 z-30">
                    {(user.images?.length > 1) && user.images.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white transition-all duration-300 ${i === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 flex z-20">
                    <div className="h-full w-1/3" onClick={prevImage} />
                    <div className="h-full w-2/3" onClick={nextImage} />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 z-30 pointer-events-none">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 mb-1 overflow-hidden">
                            <h2 className={`font-black tracking-tight text-white truncate ${user.name.length > 12 ? 'text-2xl' : 'text-3xl'}`}>
                                {user.name}, {user.age}
                            </h2>
                            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full border border-green-500/30">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[7px] font-black uppercase text-green-400 tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4 text-white/60">
                            <MapPin size={14} className="text-pink-500 flex-shrink-0" />
                            <span className="text-[10px] font-bold tracking-wide italic whitespace-nowrap">{(user._id?.toString().charCodeAt(0) % 5 || 0) + 1} miles away</span>
                            <span className="opacity-20">•</span>
                            <ShieldCheck size={14} className="text-blue-400 flex-shrink-0" />
                            <span className="text-[10px] font-bold">Verified</span>
                        </div>

                        <p className="text-white/80 text-sm leading-snug mb-4 line-clamp-2 italic font-medium">
                            "{user.bio || "Just joined! Say hi and let's see if we vibe."}"
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                            {user.interests?.slice(0, 3).map((interest, i) => (
                                <span key={i} className="px-3 py-1 glass-morphism rounded-lg text-[8px] font-black uppercase tracking-widest text-white/80 whitespace-nowrap">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    style={{ opacity: likeOpacity, scale: likeScale }}
                    className="absolute top-20 left-6 border-4 border-green-500 text-green-500 px-4 py-1 rounded-xl font-black text-3xl -rotate-12 uppercase tracking-tighter z-50 pointer-events-none"
                >
                    Like
                </motion.div>
                <motion.div
                    style={{ opacity: nopeOpacity, scale: nopeScale }}
                    className="absolute top-20 right-6 border-4 border-red-500 text-red-500 px-4 py-1 rounded-xl font-black text-3xl rotate-12 uppercase tracking-tighter z-50 pointer-events-none"
                >
                    Nope
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SwipeCard;

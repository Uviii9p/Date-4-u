"use client";
import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, X, Star, Info, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

const SwipeCard = ({ user, onSwipe, isTop }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -250, 0, 250, 300], [0, 1, 1, 1, 0]);

    // Smooth indicators
    const likeScale = useTransform(x, [0, 150], [0.8, 1.2]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeScale = useTransform(x, [0, -150], [0.8, 1.2]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (event, info) => {
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
        } else {
            setCurrentImgIndex(0); // Loop
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (currentImgIndex > 0) {
            setCurrentImgIndex(prev => prev - 1);
        }
    };

    return (
        <motion.div
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity, zIndex: isTop ? 50 : 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1 }}
            exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
            className="absolute inset-x-0 top-0 h-[75vh] w-full max-w-[420px] mx-auto cursor-grab active:cursor-grabbing"
        >
            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden bg-neutral-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] group">
                {/* Image Layer */}
                <div className="absolute inset-0">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImgIndex}
                            src={user.images?.[currentImgIndex] || `https://images.unsplash.com/photo-${1500000000000 + (user.age * 1000000)}?w=800`}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt={user.name}
                        />
                    </AnimatePresence>

                    {/* Shadow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
                </div>

                {/* Top Bar Indicators */}
                <div className="absolute top-6 inset-x-8 flex gap-2 z-30">
                    {user.images?.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                initial={false}
                                animate={{ width: i <= currentImgIndex ? "100%" : "0%" }}
                                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    ))}
                    {(!user.images || user.images.length === 0) && (
                        <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-white" />
                        </div>
                    )}
                </div>

                {/* Interaction Taps */}
                <div className="absolute inset-0 flex z-20">
                    <div className="h-full w-1/3" onClick={prevImage} />
                    <div className="h-full w-2/3" onClick={nextImage} />
                </div>

                {/* Content Layer */}
                <div className="absolute inset-x-0 bottom-0 p-8 z-30 pointer-events-none">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black tracking-tighter text-white">{user.name}, {user.age}</h2>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-black uppercase text-green-400 tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 text-white/60">
                            <MapPin size={16} className="text-pink-500" />
                            <span className="text-xs font-bold tracking-wide italic">{(user._id.charCodeAt(0) % 5) + 1} miles away</span>
                            <span className="mx-1 opacity-20">•</span>
                            <ShieldCheck size={16} className="text-blue-400" />
                            <span className="text-xs font-bold">Verified</span>
                        </div>

                        <p className="text-white/80 text-lg leading-relaxed mb-6 line-clamp-2 italic font-medium">
                            "{user.bio || "Just joined! Say hi and let's see if we vibe."}"
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {user.interests?.slice(0, 3).map((interest, i) => (
                                <span key={i} className="px-4 py-1.5 glass-morphism rounded-xl text-[10px] font-black uppercase tracking-widest text-white/90">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Like/Nope Stamps */}
                <motion.div
                    style={{ opacity: likeOpacity, scale: likeScale }}
                    className="absolute top-24 left-10 border-4 border-green-500 text-green-500 px-6 py-1 rounded-xl font-black text-4xl -rotate-12 uppercase tracking-tighter z-50 pointer-events-none"
                >
                    Like
                </motion.div>
                <motion.div
                    style={{ opacity: nopeOpacity, scale: nopeScale }}
                    className="absolute top-24 right-10 border-4 border-red-500 text-red-500 px-6 py-1 rounded-xl font-black text-4xl rotate-12 uppercase tracking-tighter z-50 pointer-events-none"
                >
                    Nope
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SwipeCard;

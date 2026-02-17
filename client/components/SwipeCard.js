"use client";
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, Info, MapPin } from 'lucide-react';

const SwipeCard = ({ user, onSwipe }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const dislikeOpacity = useTransform(x, [-50, -150], [0, 1]);
    const superLikeOpacity = useTransform(x, [-20, 0, 20], [0, 0, 0]); // Reserved for vertical swipe

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('right', user._id);
        } else if (info.offset.x < -100) {
            onSwipe('left', user._id);
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (currentImgIndex < (user.images?.length || 1) - 1) {
            setCurrentImgIndex(prev => prev + 1);
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
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            className="absolute inset-0 w-full h-[75vh] glass-card overflow-hidden touch-none shadow-2xl rounded-[2rem]"
        >
            {/* Image Container */}
            <div className="relative w-full h-full bg-neutral-800">
                <img
                    src={user.images?.[currentImgIndex] || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800'}
                    alt={user.name}
                    className="w-full h-full object-cover select-none pointer-events-none transition-all duration-500"
                />

                {/* Image Pagination Taps */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/2 h-full z-10 cursor-pointer" onClick={prevImage} />
                    <div className="w-1/2 h-full z-10 cursor-pointer" onClick={nextImage} />
                </div>

                {/* Image Indicators */}
                <div className="absolute top-4 inset-x-4 flex gap-1 z-20">
                    {user.images?.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === currentImgIndex ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-8 text-white z-20">
                <div className="flex items-end justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-4xl font-black tracking-tight">{user.name}, {user.age}</h2>
                            {user.onlineStatus && <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                        </div>
                        <div className="flex items-center gap-1 text-gray-300 text-sm mt-1 uppercase font-bold tracking-widest">
                            <MapPin size={14} className="text-pink-500" />
                            <span>{Math.floor(Math.random() * 10) + 1} miles away</span>
                        </div>
                    </div>
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all">
                        <Info size={24} />
                    </button>
                </div>

                <p className="text-gray-100/90 text-lg leading-snug line-clamp-2 italic mb-6">
                    "{user.bio || "Looking for someone to explore the city with."}"
                </p>

                <div className="flex flex-wrap gap-2">
                    {user.interests?.slice(0, 3).map(interest => (
                        <span key={interest} className="px-4 py-1.5 bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-xl border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-pink-200">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>

            {/* Swipe Indicators */}
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-20 left-10 border-8 border-green-500 text-green-500 px-6 py-2 rounded-2xl font-black text-6xl -rotate-12 z-30 uppercase tracking-tighter">
                Like
            </motion.div>
            <motion.div style={{ opacity: dislikeOpacity }} className="absolute top-20 right-10 border-8 border-red-500 text-red-500 px-6 py-2 rounded-2xl font-black text-6xl rotate-12 z-30 uppercase tracking-tighter">
                Nope
            </motion.div>
        </motion.div>
    );
};

export default SwipeCard;

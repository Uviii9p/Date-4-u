"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import SwipeCard from '@/components/SwipeCard';
import { Heart, X, Star, MessageSquare, Zap, Sparkles, Filter, Settings2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Discover() {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchDiscovery = async () => {
      try {
        const { data } = await api.get('/users/discovery');
        setProfiles(data);
      } catch (err) {
        console.error('Discovery Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDiscovery();
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 8000);
      return () => clearTimeout(safetyTimeout);
    }
  }, [user, authLoading, router]);

  const handleSwipe = async (direction, targetUserId) => {
    if (!targetUserId) return;

    // Find the swiped user for the match check later
    const targetUser = profiles.find(p => p._id === targetUserId);

    // Optimistic UI update
    setProfiles(prev => prev.filter(p => p._id !== targetUserId));

    try {
      const { data } = await api.post('/matches/swipe', {
        targetUserId,
        direction: direction === 'right' ? 'like' : 'dislike'
      });

      if (data.match) {
        setMatchData(data.targetUser);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF0080', '#7928CA', '#ffffff']
        });
      }
    } catch (err) {
      console.error('Swipe API Error:', err);
    }
  };

  if (authLoading || (loading && profiles.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full border-2 border-pink-500/20 bg-pink-500/5 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,0,128,0.1)]">
            <Heart size={40} className="text-pink-600 fill-pink-600 animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500/50">Warping to Matches...</p>
        </motion.div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-32 h-32 mb-10"
        >
          <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-[60px] animate-pulse" />
          <div className="relative w-full h-full glass-card border-white/10 flex items-center justify-center">
            <Sparkles size={48} className="text-pink-500/60" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-black tracking-tighter mb-4 italic text-white uppercase">Frequency Offline.</h2>
        <p className="text-gray-500 font-medium max-w-[260px] mx-auto leading-relaxed mb-10 text-sm">
          You've explored the nearby collective. Rewind or expand your reach.
        </p>

        <button
          onClick={() => router.push('/profile/edit')}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
        >
          <Settings2 size={16} /> Expand Radius
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      {/* Premium Header */}
      <header className="absolute top-0 inset-x-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <div className="w-10 h-10 rounded-2xl glass-morphism border-white/10 flex items-center justify-center overflow-hidden">
            {user?.images?.[0] ? <img src={user.images[0]} className="w-full h-full object-cover" /> : <Settings2 size={16} className="text-white/40" />}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-2xl font-black italic tracking-tighter gradient-text uppercase tracking-[0.3em]">Date2W</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <button
            onClick={() => router.push('/search')}
            className="w-10 h-10 rounded-2xl glass-morphism border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all shadow-lg active:scale-90"
          >
            <Filter size={16} />
          </button>
        </motion.div>
      </header>

      {/* Discover Area */}
      <main className="flex-1 relative flex flex-col items-center justify-start px-4 pt-28 pb-48">
        <div className="relative w-full max-w-[390px] aspect-[3/4.4]">
          <AnimatePresence mode="popLayout">
            {profiles.slice(0, 3).reverse().map((profile, index) => (
              <SwipeCard
                key={profile._id}
                user={profile}
                onSwipe={handleSwipe}
                isTop={index === Math.min(profiles.length, 3) - 1}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Controls */}
      <div className="fixed bottom-36 inset-x-0 z-[100] flex justify-center items-center gap-4 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.8 }}
          onClick={() => handleSwipe('left', profiles[0]?._id)}
          className="pointer-events-auto w-15 h-15 rounded-full glass-morphism border-white/10 flex items-center justify-center text-red-500 shadow-[0_15px_30px_rgba(239,68,68,0.2)] group relative overflow-hidden active:bg-red-500/20 transition-all border-b-4 border-red-500/20"
        >
          <X size={30} strokeWidth={3} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-12 h-12 rounded-full glass-morphism border-white/10 flex items-center justify-center text-yellow-500 shadow-2xl"
        >
          <Star size={20} fill="currentColor" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right', profiles[0]?._id)}
          className="pointer-events-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_20px_40px_rgba(255,0,128,0.3)] group relative overflow-hidden active:scale-95 border-b-4 border-black/30"
        >
          <Heart size={42} strokeWidth={2.5} fill="currentColor" className="animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-12 h-12 rounded-full glass-morphism border-white/10 flex items-center justify-center text-blue-400 shadow-2xl"
        >
          <Zap size={20} fill="currentColor" />
        </motion.button>
      </div>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/99 backdrop-blur-[100px] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mesh-background" />
            <div className="bg-grain" />

            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mb-14"
            >
              <h1 className="text-8xl font-black italic tracking-tight uppercase landing-text shadow-glow">
                ALIGNED
              </h1>
              <p className="text-white text-[10px] font-black tracking-[0.8em] uppercase opacity-60">Frequency Sync Complete</p>
            </motion.div>

            <div className="flex items-center -space-x-12 mb-20 relative">
              <motion.div
                initial={{ x: -120, opacity: 0, rotate: -20, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, rotate: -12, scale: 1 }}
                className="w-52 h-52 rounded-[3.5rem] border-4 border-white/20 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-10"
              >
                <img src={user.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="w-22 h-22 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center z-30 shadow-[0_0_80px_rgba(255,0,128,0.7)] border-8 border-black"
              >
                <Heart size={36} fill="white" className="text-white" />
              </motion.div>

              <motion.div
                initial={{ x: 120, opacity: 0, rotate: 20, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, rotate: 12, scale: 1 }}
                className="w-52 h-52 rounded-[3.5rem] border-4 border-white/20 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative z-20"
              >
                <img src={matchData.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            <div className="w-full max-w-sm space-y-6">
              <button
                onClick={() => router.push(`/chat/${matchData._id}`)}
                className="w-full py-6 btn-primary rounded-3xl text-[11px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-4 active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,0,128,0.4)]"
              >
                <MessageSquare size={22} fill="currentColor" /> Initiate Transmission
              </button>

              <button
                onClick={() => setMatchData(null)}
                className="w-full py-6 rounded-3xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-all active:bg-white/10"
              >
                Return to Collective
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .shadow-glow {
            text-shadow: 0 0 40px rgba(255, 0, 128, 0.5);
            color: white;
        }
      `}</style>
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import SwipeCard from '@/components/SwipeCard';
import { Heart, X, Star, MessageSquare, Zap, Sparkles, Filter, Settings2 } from 'lucide-react';
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDiscovery();
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(safetyTimeout);
    }
  }, [user, authLoading, router]);

  const handleSwipe = async (direction, targetUserId) => {
    const targetUser = profiles.find(p => p._id === targetUserId);
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
      console.error(err);
    }
  };

  if (authLoading || (loading && profiles.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full border border-pink-500/20 bg-pink-500/5 flex items-center justify-center">
            <Heart size={48} className="text-pink-600 fill-pink-600 animate-pulse" />
          </div>
          <div className="absolute inset-x-0 -bottom-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/50">Finding Matches</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="min-h-screen bg-black p-8 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-48 h-48 mb-12"
        >
          <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-full h-full glass-card border-white/10 flex items-center justify-center">
            <Sparkles size={64} className="text-pink-500/40" />
          </div>
        </motion.div>

        <h2 className="text-4xl font-black tracking-tighter mb-4 italic">End of the Vibes.</h2>
        <p className="text-gray-500 font-medium max-w-[280px] mx-auto leading-relaxed mb-10">
          You've vibed with everyone nearby for today. Come back tomorrow!
        </p>

        <button
          onClick={() => router.push('/profile/edit')}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Settings2 size={16} /> Expand Search Area
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden flex flex-col">
      {/* Dynamic Header */}
      <header className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 pointer-events-auto cursor-pointer"
          onClick={() => router.push('/profile/edit')}
        >
          <div className="w-10 h-10 rounded-full glass-morphism border-white/10 flex items-center justify-center overflow-hidden">
            {user?.images?.[0] ? <img src={user.images[0]} className="w-full h-full object-cover" /> : <Settings2 size={18} className="text-white/40" />}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pointer-events-auto"
        >
          <h1 className="text-xl font-black italic tracking-tighter gradient-text">DATE2W</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 pointer-events-auto"
        >
          <button className="w-10 h-10 rounded-full glass-morphism border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
            <Filter size={18} />
          </button>
        </motion.div>
      </header>

      {/* Main Discover Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center px-4 pt-16">
        <div className="relative w-full max-w-[420px] aspect-[3/4.2]">
          <AnimatePresence>
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

      {/* Action Controls - Float over everything */}
      <div className="fixed bottom-28 inset-x-0 z-[100] flex justify-center items-center gap-5 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left', profiles[0]?._id)}
          className="pointer-events-auto w-16 h-16 rounded-full glass-morphism border-white/10 flex items-center justify-center text-red-500 shadow-xl group overflow-hidden"
        >
          <X size={32} strokeWidth={3} />
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 rounded-full glass-morphism border-white/10 flex items-center justify-center text-yellow-500 shadow-xl group overflow-hidden"
        >
          <Star size={24} fill="currentColor" />
          <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right', profiles[0]?._id)}
          className="pointer-events-auto w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-[0_15px_30px_rgba(255,0,128,0.3)] shadow-xl group overflow-hidden"
        >
          <Heart size={40} strokeWidth={2.5} fill="currentColor" className="animate-pulse" />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 rounded-full glass-morphism border-white/10 flex items-center justify-center text-blue-400 shadow-xl group overflow-hidden"
        >
          <Zap size={24} fill="currentColor" />
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </div>

      {/* Match Overlay */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="mb-12"
            >
              <h1 className="text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-white to-purple-500 animate-gradient">
                IT'S A MATCH!
              </h1>
            </motion.div>

            <div className="flex items-center -space-x-12 mb-16 px-10">
              <motion.div
                initial={{ x: -100, opacity: 0, rotate: -15 }}
                animate={{ x: 0, opacity: 1, rotate: -10 }}
                className="w-48 h-48 rounded-[3rem] border-4 border-white/10 overflow-hidden shadow-2xl relative z-10"
              >
                <img src={user.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center z-30 shadow-[0_0_40px_rgba(255,0,128,0.5)] border-4 border-black"
              >
                <Heart size={36} fill="white" className="text-white" />
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0, rotate: 15 }}
                animate={{ x: 0, opacity: 1, rotate: 10 }}
                className="w-48 h-48 rounded-[3rem] border-4 border-white/10 overflow-hidden shadow-2xl relative z-20"
              >
                <img src={matchData.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-full object-cover" />
              </motion.div>
            </div>

            <p className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">
              {matchData.name} <span className="text-pink-500">Liked</span> You Back!
            </p>
            <p className="text-gray-500 font-bold mb-12 tracking-wide text-sm uppercase">You can now start a conversation</p>

            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={() => router.push(`/chat/${matchData._id}`)}
                className="w-full py-6 btn-primary rounded-[2rem] text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 active:scale-95 transition-all shadow-pink-500/20 shadow-2xl"
              >
                <MessageSquare size={20} fill="currentColor" /> Send Message
              </button>

              <button
                onClick={() => setMatchData(null)}
                className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/10 text-xs font-black tracking-widest uppercase text-white hover:bg-white/10 transition-all"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes gradient {
           0% { background-position: 0% 50%; }
           50% { background-position: 100% 50%; }
           100% { background-position: 0% 50%; }
        }
        .animate-gradient {
           background-size: 200% 200%;
           animation: gradient 3s ease infinite;
         }
      `}</style>
    </div>
  );
}

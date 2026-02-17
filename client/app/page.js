"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import SwipeCard from '@/components/SwipeCard';
import { Heart, X, Star, MessageSquare, Zap } from 'lucide-react';
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
      // Safety timeout
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
      }, 5000);
      return () => clearTimeout(safetyTimeout);
    }
  }, [user, authLoading, router]);

  const handleSwipe = async (direction, targetUserId) => {
    // Optimistic UI update
    const swipedUser = profiles.find(p => p._id === targetUserId);
    setProfiles(prev => prev.filter(p => p._id !== targetUserId));

    try {
      const { data } = await api.post('/matches/swipe', {
        targetUserId,
        direction: direction === 'right' ? 'like' : 'dislike'
      });

      if (data.match) {
        setMatchData(data.targetUser);
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FF0080', '#7928CA', '#ffffff'],
          ticks: 200
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (loading && profiles.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/5 rounded-full" />
          <div className="absolute inset-0 w-24 h-24 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <FlameIcon className="absolute inset-0 m-auto text-pink-500 animate-pulse" />
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Scanning Nearby</p>

        {/* Fallback for potential hangs */}
        <button
          onClick={() => window.location.reload()}
          className="mt-12 text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors"
        >
          Taking too long? Tap to reload
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-[#0A0A0A]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 glass-card flex items-center justify-center mb-8 border-white/5 shadow-pink-500/10 shadow-2xl"
        >
          <Heart className="text-pink-500/20 fill-pink-500/10" size={64} />
        </motion.div>
        <h2 className="text-3xl font-black tracking-tighter mb-4 italic">That's everyone for now!</h2>
        <p className="text-gray-500 font-medium max-w-[250px] mx-auto leading-relaxed">
          You've seen everyone in your area. Come back later or expand your discovery settings.
        </p>
        <button
          onClick={() => router.push('/profile/edit')}
          className="mt-10 text-xs font-black uppercase tracking-widest text-pink-500 border-b-2 border-pink-500/30 pb-1"
        >
          Change Filters
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[50vh] bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-[120px] -z-10" />

      {/* Cards Stack */}
      <div className="relative h-[80vh] w-full flex items-center justify-center pt-6 px-4">
        <div className="relative w-full max-w-[420px] h-full">
          <AnimatePresence>
            {profiles.map((profile) => (
              <SwipeCard
                key={profile._id}
                user={profile}
                onSwipe={handleSwipe}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center items-center gap-6 z-30 pointer-events-none">
        <button
          onClick={() => handleSwipe('left', profiles[profiles.length - 1]?._id)}
          className="pointer-events-auto relative w-16 h-16 glass-card border-white/10 flex items-center justify-center text-red-500 shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          <X size={32} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          className="pointer-events-auto w-14 h-14 glass-card border-white/10 flex items-center justify-center text-yellow-500 shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          <Star size={24} fill="currentColor" strokeWidth={0} className="group-hover:scale-125 transition-transform" />
        </button>

        <button
          onClick={() => handleSwipe('right', profiles[profiles.length - 1]?._id)}
          className="pointer-events-auto relative w-16 h-16 glass-card border-white/10 flex items-center justify-center text-green-500 shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          <Heart size={32} strokeWidth={3} fill="none" className="group-hover:fill-green-500/20 transition-all" />
          <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          className="pointer-events-auto w-14 h-14 glass-card border-white/10 flex items-center justify-center text-purple-500 shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          <Zap size={24} fill="currentColor" strokeWidth={0} className="group-active:scale-150 transition-transform" />
        </button>
      </div>

      {/* Match Popup Celebration */}
      <AnimatePresence>
        {matchData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="mb-10 relative"
            >
              <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-white to-purple-600 animate-gradient">
                MATCH!
              </h1>
              <div className="absolute -inset-4 bg-white/10 blur-3xl rounded-full -z-10 animate-pulse" />
            </motion.div>

            <div className="flex items-center -space-x-8 mb-12">
              <motion.div
                initial={{ x: -100, opacity: 0, rotate: -15 }}
                animate={{ x: 0, opacity: 1, rotate: -10 }}
                className="w-40 h-40 rounded-[2.5rem] border-4 border-white/20 overflow-hidden shadow-2xl shadow-pink-500/20"
              >
                <img src={user.images?.[0]} className="w-full h-full object-cover" alt="" />
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center z-20 shadow-2xl"
              >
                <Heart size={32} className="text-pink-500 fill-pink-500" />
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0, rotate: 15 }}
                animate={{ x: 0, opacity: 1, rotate: 10 }}
                className="w-40 h-40 rounded-[2.5rem] border-4 border-white/20 overflow-hidden shadow-2xl shadow-purple-500/20"
              >
                <img src={matchData.images?.[0]} className="w-full h-full object-cover" alt="" />
              </motion.div>
            </div>

            <p className="text-2xl font-black text-white mb-10 tracking-tight">
              You and <span className="text-pink-500">{matchData.name}</span> like each other!
            </p>

            <div className="w-full max-w-xs space-y-4">
              <button
                onClick={() => {
                  setMatchData(null);
                  router.push(`/chat/${matchData._id}`);
                }}
                className="w-full py-5 btn-primary relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs">
                  <MessageSquare size={18} /> Send a Message
                </span>
              </button>

              <button
                onClick={() => setMatchData(null)}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-widest text-[10px] text-gray-500 hover:text-white transition-colors"
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

function FlameIcon({ className }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 7 8 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 8 12 2 12 2Z" opacity="0.5" />
      <path d="M12 7C12 7 9.5 10 9.5 12.5C9.5 13.8807 10.6193 15 12 15C13.3807 15 14.5 13.8807 14.5 12.5C14.5 10 12 7 12 7Z" />
    </svg>
  )
}

"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart, MessageCircle, User, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

const BottomNav = () => {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user || pathname === '/login' || pathname === '/register') return null;

    const navItems = [
        { href: '/', icon: Flame, label: 'Discover' },
        { href: '/search', icon: Search, label: 'Search' },
        { href: '/matches', icon: Heart, label: 'Matches' },
        { href: '/chat', icon: MessageCircle, label: 'Chats' },
        { href: '/profile', icon: User, label: 'Profile' }
    ];

    return (
        <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="pointer-events-auto h-20 w-full max-w-sm glass-morphism border-white/10 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl relative overflow-hidden"
            >
                {/* Background active pill tracker */}
                <div className="absolute inset-0 z-0 flex items-center justify-around px-4 pointer-events-none">
                    {navItems.map((item, idx) => (
                        <div key={idx} className="w-12 h-12 relative">
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/5 rounded-2xl"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`relative z-10 flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${isActive ? 'text-pink-500 scale-110' : 'text-gray-500 hover:text-white'}`}
                        >
                            <motion.div
                                whileTap={{ scale: 0.8 }}
                                className="relative"
                            >
                                <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="absolute -bottom-1.5 left-1/2 -translateX-1/2 w-1 h-1 bg-pink-500 rounded-full"
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[8px] font-black uppercase mt-1 tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default BottomNav;

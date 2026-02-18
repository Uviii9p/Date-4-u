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
        { href: '/', icon: Flame, label: 'Vibe' },
        { href: '/search', icon: Search, label: 'Search' },
        { href: '/matches', icon: Heart, label: 'Matches' },
        { href: '/chat', icon: MessageCircle, label: 'Inbox' },
        { href: '/profile', icon: User, label: 'Me' }
    ];

    return (
        <div className="bottom-nav-container">
            <motion.nav
                className="h-16 w-[360px] flex items-center justify-around px-2 relative"
            >
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="relative flex flex-col items-center justify-center w-14 h-14"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`relative flex flex-col items-center transition-colors duration-300 ${isActive ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 3 : 2} />
                                <span className={`text-[8px] font-black uppercase mt-1 tracking-[0.2em] transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                                    {label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="nav-glow"
                                        className="absolute -inset-2 bg-pink-500/10 blur-xl rounded-full -z-10"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default BottomNav;

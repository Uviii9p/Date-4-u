"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Heart, MessageCircle, User, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
        <nav className="bottom-nav">
            {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                    <Link key={href} href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
                        <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                        <span className="text-[10px] font-medium">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomNav;

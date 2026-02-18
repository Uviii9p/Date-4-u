import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { CallProvider } from '@/context/CallContext';
import BottomNav from '@/components/BottomNav';

// Polyfills moved to client-side only to prevent breaking server-side build
if (typeof window !== 'undefined') {
  try {
    const { Buffer } = require('buffer');
    window.Buffer = window.Buffer || Buffer;
    window.process = window.process || require('process');

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  } catch (e) {
    console.warn('Polyfill loading failed', e);
  }
}

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Date2W | Modern Dating',
  description: 'Find your perfect match in 2026 style.',
  manifest: '/manifest.json',
  themeColor: '#ec4899',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        <div className="mesh-background" />
        <div className="bg-grain" />
        <AuthProvider>
          <SocketProvider>
            <CallProvider>
              <main className="pb-24 min-h-screen relative flex flex-col items-center">
                <div className="w-full max-w-lg min-h-screen relative">
                  {children}
                </div>
                <BottomNav />
              </main>
            </CallProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

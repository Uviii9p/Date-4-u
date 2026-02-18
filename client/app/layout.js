import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';

// Polyfills moved to client-side only to prevent breaking server-side build
if (typeof window !== 'undefined') {
  try {
    const { Buffer } = require('buffer');
    window.Buffer = window.Buffer || Buffer;
    window.process = window.process || require('process');
  } catch (e) {
    console.warn('Polyfill loading failed', e);
  }
}

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Date2W | Modern Dating',
  description: 'Find your perfect match in 2026 style.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative`}>
        <div className="mesh-background" />
        <div className="bg-grain" />
        <AuthProvider>
          <main className="pb-24 min-h-screen relative flex flex-col items-center">
            <div className="w-full max-w-lg min-h-screen relative">
              {children}
            </div>
            <BottomNav />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

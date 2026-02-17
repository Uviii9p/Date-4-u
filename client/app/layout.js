import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';

if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
  window.process = window.process || require('process');
}

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Date2W | Modern Dating',
  description: 'Find your perfect match in 2026 style.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <main className="pb-24 min-h-screen relative overflow-hidden flex flex-col items-center">
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

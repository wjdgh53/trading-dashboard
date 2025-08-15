import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NomadVibe - Trading Dashboard',
  description: 'Advanced trading dashboard with AI-powered insights and real-time market data',
  keywords: ['trading', 'dashboard', 'crypto', 'stocks', 'AI', 'market analysis'],
  authors: [{ name: 'NomadVibe Team' }],
  creator: 'NomadVibe',
  publisher: 'NomadVibe',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nomadvibe-trading.vercel.app',
    siteName: 'NomadVibe Trading Dashboard',
    title: 'NomadVibe - Trading Dashboard',
    description: 'Advanced trading dashboard with AI-powered insights and real-time market data',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NomadVibe - Trading Dashboard',
    description: 'Advanced trading dashboard with AI-powered insights and real-time market data',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-950">
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
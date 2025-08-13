import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
        <div className="min-h-screen bg-gradient-to-br from-trading-dark via-trading-dark-light to-trading-dark">
          <div className="relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                }}
              />
            </div>
            
            {/* Main content */}
            <main className="relative z-10">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
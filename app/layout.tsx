import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import Nav from '@/components/ui/Nav';
import AuthLoader from './auth-loader';

export const metadata: Metadata = {
  title: 'Career DNA — Discover Your Career Type',
  description: 'MBTI-style career intelligence for Malaysian university students',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;1,400&family=Switzer:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AppProvider>
            <AuthProvider>
              <Nav />
              <AuthLoader>
                <main className="min-h-screen">{children}</main>
              </AuthLoader>
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

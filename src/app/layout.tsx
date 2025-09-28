import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Comic_Neue, Homemade_Apple } from 'next/font/google';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/contexts/AuthContext';

const comicNeue = Comic_Neue({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-comic-neue',
});

const homemadeApple = Homemade_Apple({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-homemade-apple',
});


export const metadata: Metadata = {
  title: 'GourmetNet',
  description: 'Your personal AI chef for recipe generation and cooking guidance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${comicNeue.variable} ${homemadeApple.variable} font-sans antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

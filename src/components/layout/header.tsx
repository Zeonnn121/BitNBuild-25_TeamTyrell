'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';
import { BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b px-4 sm:px-6 py-2.5 shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <div className='flex items-center gap-2'>
          <Image src="/icon.svg" alt="GourmetNet icon" width={32} height={32} />
          <h1 className="text-xl font-headline font-bold tracking-tight text-primary">
            GourmetNet
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-2">
        <Link href="/">
          <Button 
            variant={pathname === '/' ? 'default' : 'ghost'} 
            size="sm" 
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button 
            variant={pathname === '/dashboard' ? 'default' : 'ghost'} 
            size="sm" 
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </nav>
    </header>
  );
};

export default Header;

import Image from 'next/image';
import { SidebarTrigger } from '../ui/sidebar';

const Header = () => {
  return (
    <header className="flex items-center gap-4 border-b px-4 sm:px-6 py-2.5 shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
       <SidebarTrigger className="h-8 w-8" />
      <div className='flex items-center gap-2'>
        <Image src="/icon.svg" alt="GourmetNet icon" width={32} height={32} />
        <h1 className="text-xl font-headline font-bold tracking-tight text-primary">
          GourmetNet
        </h1>
      </div>
    </header>
  );
};

export default Header;

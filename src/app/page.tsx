import ChatInterface from '@/components/chat/chat-interface';
import HistorySidebar from '@/components/layout/history-sidebar';
import Header from '@/components/layout/header';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';


export default function Home() {
  return (
    <>
      <Sidebar>
        <HistorySidebar/>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-hidden">
            <ChatInterface />
          </main>
        </div>
      </SidebarInset>
    </>
  );
}

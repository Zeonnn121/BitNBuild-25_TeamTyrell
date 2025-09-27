'use client';

import { useState, useCallback } from 'react';
import ChatInterface from '@/components/chat/chat-interface';
import HistorySidebar from '@/components/layout/history-sidebar';
import Header from '@/components/layout/header';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import type { Message } from '@/lib/types';
import { nanoid } from 'nanoid';

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  const createNewChat = () => {
    const newChatId = nanoid();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      updatedAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = (chatIdToDelete: string) => {
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== chatIdToDelete);
      
      // If we're deleting the current chat, switch to the first available chat or create a new one
      if (chatIdToDelete === currentChatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
        } else {
          // If no chats left, create a new one
          const newChatId = nanoid();
          const newChat: Chat = {
            id: newChatId,
            title: 'New Chat',
            messages: [],
            updatedAt: new Date(),
          };
          setCurrentChatId(newChatId);
          return [newChat];
        }
      }
      
      return updatedChats;
    });
  };

  const updateChatMessages = useCallback((messages: Message[]) => {
    if (!currentChatId) return;

    setChats(prev => prev.map(chat => {
      if (chat.id === currentChatId) {
        // Update title based on first user message if it's still "New Chat"
        let title = chat.title;
        if (title === 'New Chat' && messages.length > 0) {
          const firstUserMessage = messages.find(m => m.role === 'user');
          if (firstUserMessage && typeof firstUserMessage.content === 'string') {
            title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
          }
        }

        return {
          ...chat,
          title,
          messages,
          updatedAt: new Date(),
        };
      }
      return chat;
    }));
  }, [currentChatId]);

  // Create first chat if none exist
  if (chats.length === 0 && currentChatId === null) {
    createNewChat();
  }

  return (
    <>
      <Sidebar>
        <HistorySidebar
          chats={chats}
          currentChatId={currentChatId}
          onNewChat={createNewChat}
          onSelectChat={selectChat}
          onDeleteChat={deleteChat}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <main className="flex-1 overflow-hidden">
            <ChatInterface
              messages={currentChat?.messages || []}
              onMessagesUpdate={updateChatMessages}
            />
          </main>
        </div>
      </SidebarInset>
    </>
  );
}

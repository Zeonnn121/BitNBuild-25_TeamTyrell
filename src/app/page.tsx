'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatInterface from '@/components/chat/chat-interface';
import HistorySidebar from '@/components/layout/history-sidebar';
import Header from '@/components/layout/header';
import { Sidebar, SidebarInset } from '@/components/ui/sidebar';
import type { Message } from '@/lib/types';
import { nanoid } from 'nanoid';
import { loadUserChats, saveChat, deleteChat as deleteChatFromDB } from '@/lib/chatService';
import { useToast } from '@/hooks/use-toast';

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  userId?: string;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  // Load user chats when user signs in
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        setIsLoadingChats(true);
        setLoadingProgress(0);
        
        // Progress animation
        const progressInterval = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev >= 90) return prev; // Cap at 90% until actually loaded
            return prev + Math.random() * 15;
          });
        }, 200);
        
        // Create a timeout promise that resolves after 5 seconds
        const timeoutPromise = new Promise<Chat[]>((resolve) => {
          setTimeout(() => {
            console.log('Chat loading timeout reached, creating fresh chat silently');
            clearInterval(progressInterval);
            setLoadingProgress(100);
            resolve([]);
          }, 5000);
        });
        
        // Create a load promise
        const loadPromise = loadUserChats(user.uid).then(chats => {
          clearInterval(progressInterval);
          setLoadingProgress(100);
          return chats;
        });
        
        try {
          // Race between loading chats and timeout
          const userChats = await Promise.race([loadPromise, timeoutPromise]);
          
          setChats(userChats);
          
          // Set the first chat as current if there are any chats
          if (userChats.length > 0) {
            setCurrentChatId(userChats[0].id);
          } else {
            // Create a new chat if user has no chats or timeout occurred
            createNewChat();
          }
        } catch (error) {
          clearInterval(progressInterval);
          console.error('Failed to load chats:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to load chat history',
            description: 'Your previous conversations could not be loaded.',
          });
          // Create a new chat as fallback
          createNewChat();
        } finally {
          setTimeout(() => {
            setIsLoadingChats(false);
            setLoadingProgress(0);
          }, 300); // Small delay for smooth transition
        }
      } else {
        // Clear chats when user signs out
        setChats([]);
        setCurrentChatId(null);
        setLoadingProgress(0);
      }
    };

    loadChats();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const createNewChat = useCallback(() => {
    if (!user) return;
    
    const newChatId = nanoid();
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      updatedAt: new Date(),
      userId: user.uid,
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);

    // Save to Firestore
    saveChat(newChat as any).catch(error => {
      console.error('Failed to save new chat:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save chat',
        description: 'Your new chat could not be saved.',
      });
    });
  }, [user, toast]);

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const deleteChat = useCallback((chatIdToDelete: string) => {
    setChats(prev => {
      const updatedChats = prev.filter(chat => chat.id !== chatIdToDelete);
      
      // If we're deleting the current chat, switch to the first available chat or create a new one
      if (chatIdToDelete === currentChatId) {
        if (updatedChats.length > 0) {
          setCurrentChatId(updatedChats[0].id);
        } else if (user) {
          // If no chats left, create a new one
          createNewChat();
          return prev; // Return original state since createNewChat will handle the update
        }
      }
      
      return updatedChats;
    });

    // Delete from Firestore
    deleteChatFromDB(chatIdToDelete).catch(error => {
      console.error('Failed to delete chat:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete chat',
        description: 'The chat could not be deleted from the server.',
      });
    });
  }, [currentChatId, user, createNewChat, toast]);

  const updateChatMessages = useCallback((messages: Message[]) => {
    if (!currentChatId || !user) return;

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

        const updatedChat = {
          ...chat,
          title,
          messages,
          updatedAt: new Date(),
          userId: user.uid,
        };

        // Save to Firestore
        saveChat(updatedChat as any).catch(error => {
          console.error('Failed to save chat:', error);
          toast({
            variant: 'destructive',
            title: 'Failed to save chat',
            description: 'Your chat could not be saved.',
          });
        });

        return updatedChat;
      }
      return chat;
    }));
  }, [currentChatId, user, toast]);

  // Show loading state when loading chats
  if (isLoadingChats) {
    return (
      <>
        <Sidebar>
          <HistorySidebar
            chats={[]}
            currentChatId={null}
            onNewChat={() => {}}
            onSelectChat={() => {}}
            onDeleteChat={() => {}}
          />
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <Header />
            <main className="flex-1 overflow-hidden flex items-center justify-center">
              <div className="text-center space-y-6 max-w-md">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{Math.round(loadingProgress)}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Loading your chat history</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {loadingProgress < 90 
                      ? "Retrieving your conversations..." 
                      : "Almost done..."
                    }
                  </p>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </>
    );
  }

  // Don't create a new chat automatically if user is not signed in
  // Create first chat if none exist and user is signed in
  if (chats.length === 0 && currentChatId === null && user && !isLoadingChats) {
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

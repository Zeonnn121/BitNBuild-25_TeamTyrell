'use client'

import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { Plus, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  messages: any[];
  updatedAt: Date;
}

interface HistorySidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function HistorySidebar({ chats, currentChatId, onNewChat, onSelectChat, onDeleteChat }: HistorySidebarProps) {
  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={onNewChat}
                    className="h-10 justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
            <SidebarGroupLabel>Recent</SidebarGroupLabel>
            <SidebarMenu>
                {chats.map(chat => {
                    const isActive = chat.id === currentChatId;
                    return (
                        <SidebarMenuItem key={chat.id}>
                            <div className="relative group">
                                <SidebarMenuButton 
                                    size="sm" 
                                    variant={isActive ? "default" : undefined}
                                    className={cn(
                                        "h-10 justify-start gap-2 relative group pr-10",
                                        isActive && "bg-accent/30 text-accent-foreground shadow-sm border border-border/30",
                                        !isActive && "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => onSelectChat(chat.id)}
                                >
                                    <MessageCircle className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                    <span className="truncate text-left flex-1">
                                        {chat.title}
                                    </span>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                    )}
                                </SidebarMenuButton>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className={cn(
                                        "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md",
                                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                                        "hover:bg-destructive hover:text-destructive-foreground",
                                        "text-muted-foreground hover:text-white"
                                    )}
                                    aria-label={`Delete ${chat.title}`}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

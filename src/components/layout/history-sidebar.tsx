'use client'

import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { Plus } from "lucide-react";

export default function HistorySidebar() {
  // This is a placeholder. In a real app, you'd fetch this from a store or API.
  const chatHistory = [
    { id: '1', title: 'Mushroom Risotto' },
    { id: '2', title: 'Vegan Chili' },
    { id: '3', title: 'Quick Weeknight Pasta' },
  ];

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton>
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
                {chatHistory.map(chat => (
                    <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton size="sm" variant="ghost" className="h-8">
                            {chat.title}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}

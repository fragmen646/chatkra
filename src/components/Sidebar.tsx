import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  onDeleteAllChats?: () => void;
  currentChatId?: string | null;
  chatHistory?: ChatHistory[];
  isDarkTheme?: boolean;
}

const Sidebar = ({
  isOpen = true,
  onToggle = () => {},
  onNewChat = () => {},
  onSelectChat = () => {},
  onDeleteChat = () => {},
  onDeleteAllChats = () => {},
  currentChatId = null,
  isDarkTheme = true,
  chatHistory = [
    {
      id: "1",
      title: "Percakapan tentang AI",
      date: "2 jam yang lalu",
      preview: "Bagaimana AI dapat membantu dalam pekerjaan sehari-hari?",
    },
    {
      id: "2",
      title: "Diskusi teknologi terbaru",
      date: "Kemarin",
      preview: "Apa saja teknologi yang sedang trend saat ini?",
    },
    {
      id: "3",
      title: "Bantuan coding Python",
      date: "3 hari yang lalu",
      preview: "Bagaimana cara membuat fungsi rekursif di Python?",
    },
  ],
}: SidebarProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteAllClick = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    onDeleteAllChats();
    setIsDeleteAllDialogOpen(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-16",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {isOpen && <h2 className="text-lg font-semibold">Riwayat Chat</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="ml-auto"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>

      <div className="px-3 mb-2">
        <Button onClick={onNewChat} className="w-full justify-start gap-2">
          <PlusCircle size={18} />
          {isOpen && "Chat Baru"}
        </Button>
      </div>

      {isOpen && chatHistory.length > 0 && (
        <div className="flex justify-between items-center px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {chatHistory.length} percakapan
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteAllClick}
            className="h-8 px-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}

      <Separator className="my-1" />

      <ScrollArea className="flex-1">
        <div className="px-1 py-2">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {isOpen ? "Belum ada riwayat percakapan" : ""}
              </p>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2 mb-1 cursor-pointer transition-colors",
                  currentChatId === chat.id ? "bg-accent" : "hover:bg-muted",
                  !isOpen ? "justify-center" : "",
                )}
              >
                <MessageSquare
                  size={!isOpen ? 20 : 16}
                  className="shrink-0 mt-0.5 text-muted-foreground"
                />

                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate pr-2">
                        {chat.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:text-destructive"
                        onClick={(e) => handleDeleteClick(chat.id, e)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.preview}
                    </p>
                    <span className="text-xs text-muted-foreground mt-1">
                      {chat.date}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {isOpen && (
        <div className="p-4 text-center border-t">
          <p className="text-xs text-muted-foreground">By Cakra ©2025</p>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Percakapan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus percakapan ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteAllDialogOpen}
        onOpenChange={setIsDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Percakapan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus semua riwayat percakapan?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sidebar;

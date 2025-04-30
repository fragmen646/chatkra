import React, { useState, useEffect } from "react";
import { Sun, Moon, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import ChatInterface from "./ChatInterface";
import Sidebar from "./Sidebar";
import SettingsPanel from "./SettingsPanel";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatData {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: Message[];
}

const Home = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatData[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  // Default settings
  const [settings, setSettings] = useState({
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey:
      "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",
    model: "qwen/qwen3-235b-a22b:free",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt:
      "Anda adalah asisten AI yang membantu dalam bahasa Indonesia dengan sopan dan profesional.",
    darkMode: true,
  });

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChatHistory = localStorage.getItem("chatHistory");
    const savedSettings = localStorage.getItem("settings");

    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Apply dark mode
    document.documentElement.classList.toggle("dark", isDarkTheme);
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // Load messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const chat = chatHistory.find((chat) => chat.id === currentChatId);
      if (chat) {
        setCurrentMessages(chat.messages);
      }
    } else {
      setCurrentMessages([]);
    }
  }, [currentChatId, chatHistory]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Apply theme to document
    document.documentElement.classList.toggle("dark", !isDarkTheme);
    setSettings((prev) => ({ ...prev, darkMode: !isDarkTheme }));
  };

  // Update settings function
  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  // Create new chat function
  const createNewChat = () => {
    setCurrentChatId(null);
    setCurrentMessages([]);
  };

  // Load chat function
  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  // Save chat function
  const saveChat = (messages: Message[]) => {
    if (messages.length < 2) return; // Don't save if there's only system message or no messages

    const userMessages = messages.filter((msg) => msg.role === "user");
    const lastUserMessage =
      userMessages[userMessages.length - 1]?.content || "Percakapan baru";

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("id", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(now);

    if (currentChatId) {
      // Update existing chat
      setChatHistory((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages,
              preview: lastUserMessage,
              date: formattedDate,
            };
          }
          return chat;
        }),
      );
    } else {
      // Create new chat
      const newChat: ChatData = {
        id: Date.now().toString(),
        title:
          lastUserMessage.length > 30
            ? `${lastUserMessage.substring(0, 30)}...`
            : lastUserMessage,
        date: formattedDate,
        preview: lastUserMessage,
        messages,
      };

      setChatHistory((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    }
  };

  // Delete chat function
  const deleteChat = (chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setCurrentMessages([]);
    }
  };

  // Delete all chats function
  const deleteAllChats = () => {
    setChatHistory([]);
    setCurrentChatId(null);
    setCurrentMessages([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkTheme ? "dark bg-zinc-900 text-white" : "bg-white text-zinc-900"}`}
    >
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Chat-KRA</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={isDarkTheme} onCheckedChange={toggleTheme} />
            <Moon className="h-4 w-4" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={createNewChat}
          onSelectChat={loadChat}
          onDeleteChat={deleteChat}
          onDeleteAllChats={deleteAllChats}
          currentChatId={currentChatId}
          chatHistory={chatHistory}
          isDarkTheme={isDarkTheme}
        />

        {/* Chat Interface */}
        <main className="flex-1 overflow-hidden">
          <ChatInterface
            settings={settings}
            currentChatId={currentChatId}
            isDarkTheme={isDarkTheme}
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onSaveChat={saveChat}
            initialMessages={currentMessages}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        By Cakra ©2025
      </footer>

      {/* Settings Panel */}
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSaveSettings={updateSettings}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default Home;

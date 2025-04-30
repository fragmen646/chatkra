import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatInterfaceProps {
  settings?: {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    darkMode: boolean;
  };
  currentChatId?: string | null;
  isDarkTheme?: boolean;
  onSidebarToggle?: () => void;
  onSaveChat?: (messages: Message[]) => void;
  initialMessages?: Message[];
}

const ChatInterface = ({
  settings = {
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey:
      "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",
    model: "qwen/qwen3-235b-a22b:free",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt:
      "Anda adalah asisten AI yang membantu dengan informasi dan jawaban yang akurat. Berikan respons yang jelas dan terstruktur dalam bahasa Indonesia.",
    darkMode: true,
  },
  currentChatId = null,
  isDarkTheme = true,
  onSidebarToggle = () => {},
  onSaveChat = () => {},
  initialMessages = [],
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize messages when component mounts or when initialMessages/settings change
  useEffect(() => {
    setMessages(
      initialMessages && initialMessages.length > 0
        ? initialMessages
        : [{ role: "system", content: settings.systemPrompt }],
    );
  }, [initialMessages, settings.systemPrompt]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset messages when currentChatId changes to null (new chat)
  useEffect(() => {
    if (
      currentChatId === null &&
      (!initialMessages || initialMessages.length === 0)
    ) {
      setMessages([{ role: "system", content: settings.systemPrompt }]);
      setInput("");
      setError(null);
    }
  }, [currentChatId, initialMessages, settings.systemPrompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(settings.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: settings.model,
          messages: [...messages, userMessage].filter(
            (msg) => msg.role !== "system" || messages.indexOf(msg) === 0,
          ),
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Terjadi kesalahan saat menghubungi API",
        );
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      onSaveChat([...messages, userMessage, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const visibleMessages = messages.filter((msg) => msg.role !== "system");

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl shadow-sm overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {visibleMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <h3 className="text-lg font-medium mb-2">
                  Selamat datang di Chat-KRA
                </h3>
                <p>Mulai percakapan dengan mengirim pesan.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleMessages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>AI sedang mengetik...</p>
                </div>
              )}
              {error && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda di sini..."
            className="flex-1 min-h-[60px] max-h-[200px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="self-end h-[60px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

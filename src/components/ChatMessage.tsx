import React from "react";
import { Check, Copy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock = ({ language, value }: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 rounded-md bg-muted">
      <div className="flex items-center justify-between rounded-t-md bg-muted px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm">{value}</code>
      </pre>
    </div>
  );
};

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
  isLoading?: boolean;
}

// Function to format text with markdown-like syntax
const formatText = (text: string): string => {
  if (!text) return "";

  let formattedText = text;

  // Replace **text** with <strong>text</strong> (bold)
  formattedText = formattedText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>",
  );

  // Replace *text* with <em>text</em> (italic)
  formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Replace __text__ with <u>text</u> (underline)
  formattedText = formattedText.replace(/__(.*?)__/g, "<u>$1</u>");

  // Replace ~text~ with <del>text</del> (strikethrough)
  formattedText = formattedText.replace(/~(.*?)~/g, "<del>$1</del>");

  // Replace ### headers
  formattedText = formattedText.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

  // Replace ## headers
  formattedText = formattedText.replace(/^## (.*?)$/gm, "<h2>$1</h2>");

  // Replace # headers
  formattedText = formattedText.replace(/^# (.*?)$/gm, "<h1>$1</h1>");

  // Replace bullet points
  formattedText = formattedText.replace(/^- (.*?)$/gm, "<li>$1</li>");

  // Wrap lists in <ul> tags
  formattedText = formattedText.replace(
    /(<li>.*?<\/li>)\n(?!<li>)/gs,
    "<ul>$1</ul>",
  );

  // Replace numbered lists
  formattedText = formattedText.replace(/^\d+\. (.*?)$/gm, "<li>$1</li>");

  // Wrap numbered lists in <ol> tags
  formattedText = formattedText.replace(
    /(<li>.*?<\/li>)\n(?!<li>)/gs,
    "<ol>$1</ol>",
  );

  // Replace double newlines with paragraph breaks
  formattedText = formattedText.replace(/\n\n/g, "</p><p>");

  // Wrap in paragraph tags if not already wrapped
  if (!formattedText.startsWith("<")) {
    formattedText = `<p>${formattedText}</p>`;
  }

  // Sanitize the HTML to prevent XSS attacks
  return DOMPurify.sanitize(formattedText);
};

const ChatMessage = ({ message, isLoading = false }: ChatMessageProps) => {
  // Check if message is defined before accessing its properties
  if (!message) {
    return null;
  }

  const isUser = message.role === "user";

  // Function to parse content and identify code blocks and formatting
  const parseContent = (content: string) => {
    // First handle code blocks
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex, match.index),
        });
      }

      // Add code block
      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex),
      });
    }

    return parts;
  };

  const contentParts = parseContent(message.content);

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "bg-background" : "bg-muted/30",
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="https://api.dicebear.com/7.x/bottts/svg?seed=kra" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              KRA
            </AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium">
          {isUser ? "Anda" : "Chat-KRA"}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-75"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-150"></div>
            </div>
          ) : (
            contentParts.map((part, index) => {
              if (part.type === "code") {
                return (
                  <CodeBlock
                    key={index}
                    language={part.language}
                    value={part.content}
                  />
                );
              } else {
                return (
                  <div
                    key={index}
                    className="whitespace-pre-wrap prose-sm max-w-none dark:prose-invert"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatText(part.content),
                      }}
                    />
                  </div>
                );
              }
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

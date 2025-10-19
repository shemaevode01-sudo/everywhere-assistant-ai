import { User, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLatest?: boolean;
}

const ChatMessage = ({ role, content, isLatest = false }: ChatMessageProps) => {
  const isUser = role === "user";
  const [displayedContent, setDisplayedContent] = useState(isUser || !isLatest ? content : "");
  
  useEffect(() => {
    if (!isUser && isLatest && displayedContent !== content) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 20); // 20ms per character for smooth typing
      
      return () => clearInterval(timer);
    }
  }, [content, isUser, isLatest, displayedContent]);

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-fade-in group w-full`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary group-hover:scale-110 transition-transform duration-300">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={`w-full rounded-3xl px-6 py-4 backdrop-blur-md border border-border/50 transition-all duration-300 hover:scale-[1.01] ${
          isUser
            ? "bg-primary/20 text-foreground shadow-glow-primary hover:shadow-glow-strong"
            : "bg-card/60 text-foreground shadow-glow-accent hover:shadow-glow-primary"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <CodeBlock
                      language={match[1]}
                      code={String(children).replace(/\n$/, "")}
                    />
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-4 last:mb-0 whitespace-pre-wrap break-words">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-2">{children}</h3>,
              }}
            >
              {displayedContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow-accent group-hover:scale-110 transition-transform duration-300">
          <User className="w-5 h-5 text-accent-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

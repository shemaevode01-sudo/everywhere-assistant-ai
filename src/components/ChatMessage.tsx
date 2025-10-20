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
  const [isTyping, setIsTyping] = useState(!isUser && isLatest && content.length > 0);
  
  useEffect(() => {
    if (!isUser && isLatest && displayedContent !== content) {
      setIsTyping(true);
      let index = 0;
      
      const typeNextChunk = () => {
        if (index < content.length) {
          // Type in chunks for smoother appearance (1-3 characters at a time)
          const chunkSize = Math.floor(Math.random() * 2) + 1;
          const nextIndex = Math.min(index + chunkSize, content.length);
          setDisplayedContent(content.slice(0, nextIndex));
          index = nextIndex;
          
          // Variable speed: faster for spaces, slower for punctuation
          const char = content[index - 1];
          const delay = char === ' ' ? 5 : (char === '.' || char === ',' || char === '!' || char === '?') ? 50 : 20;
          
          setTimeout(typeNextChunk, delay);
        } else {
          setIsTyping(false);
        }
      };
      
      typeNextChunk();
    }
  }, [content, isUser, isLatest, displayedContent]);

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-fade-in group w-full px-4 md:px-8`}>
      {!isUser && (
        <div className={`w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary transition-all duration-500 ${
          isTyping ? 'animate-pulse scale-110' : 'group-hover:scale-110'
        }`}>
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div
        className={`flex-1 rounded-3xl px-6 py-4 backdrop-blur-md border border-border/50 transition-all duration-300 hover:scale-[1.005] ${
          isUser
            ? "bg-primary/20 text-foreground shadow-glow-primary hover:shadow-glow-strong"
            : `bg-card/60 text-foreground shadow-glow-accent hover:shadow-glow-primary ${isTyping ? 'shadow-glow-strong' : ''}`
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
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-4 last:mb-0 whitespace-pre-wrap break-words leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-2">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6 bg-gradient-primary bg-clip-text text-transparent">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-5 text-primary">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4 text-primary/90">{children}</h3>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground">{children}</blockquote>,
                strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic text-primary/80">{children}</em>,
              }}
            >
              {displayedContent}
            </ReactMarkdown>
            {isTyping && (
              <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />
            )}
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

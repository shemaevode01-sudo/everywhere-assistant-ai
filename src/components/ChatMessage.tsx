import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={`flex gap-3 p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
        isUser
          ? "bg-primary/10 border-primary/20 ml-auto max-w-[80%]"
          : "bg-card/40 border-border/50 mr-auto max-w-[80%]"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-primary" : "bg-accent"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-accent-foreground" />
        )}
      </div>
      <div className="flex-1 text-foreground whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
};

export default ChatMessage;

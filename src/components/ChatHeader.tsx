import { RefreshCw, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
}

const ChatHeader = ({ onRefresh, onOpenSettings, onNewChat }: ChatHeaderProps) => {
  return (
    <div className="text-center py-6 relative">
      <div className="absolute right-4 top-6 flex gap-2">
        <Button
          onClick={onNewChat}
          variant="outline"
          size="icon"
          className="rounded-full bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 hover:scale-110 transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="icon"
          className="rounded-full bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 hover:scale-110 transition-all duration-300"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="icon"
          className="rounded-full bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 hover:scale-110 transition-all duration-300"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
        AI Assistant
      </h1>
      <p className="text-muted-foreground">Your personal voice-enabled assistant</p>
    </div>
  );
};

export default ChatHeader;

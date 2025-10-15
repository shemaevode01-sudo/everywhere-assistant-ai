import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voiceRate: number;
  voicePitch: number;
  onVoiceRateChange: (rate: number) => void;
  onVoicePitchChange: (pitch: number) => void;
  onClearHistory: () => void;
  messages: Message[];
}

const SettingsDialog = ({
  open,
  onOpenChange,
  voiceRate,
  voicePitch,
  onVoiceRateChange,
  onVoicePitchChange,
  onClearHistory,
  messages,
}: SettingsDialogProps) => {
  const { toast } = useToast();

  const handleExportChat = () => {
    const chatText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Chat exported",
      description: "Your chat history has been downloaded.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl">Settings</DialogTitle>
          <DialogDescription>
            Customize your AI assistant experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Voice Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="rate">
                Speech Rate: {voiceRate.toFixed(1)}x
              </Label>
              <Slider
                id="rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[voiceRate]}
                onValueChange={(value) => onVoiceRateChange(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitch">
                Voice Pitch: {voicePitch.toFixed(1)}
              </Label>
              <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[voicePitch]}
                onValueChange={(value) => onVoicePitchChange(value[0])}
                className="w-full"
              />
            </div>
          </div>

          {/* Chat Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chat Management</h3>
            
            <div className="flex gap-2">
              <Button
                onClick={handleExportChat}
                variant="outline"
                className="flex-1"
                disabled={messages.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </Button>
              
              <Button
                onClick={() => {
                  onClearHistory();
                  toast({
                    title: "Chat cleared",
                    description: "All messages have been removed.",
                  });
                }}
                variant="destructive"
                className="flex-1"
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;

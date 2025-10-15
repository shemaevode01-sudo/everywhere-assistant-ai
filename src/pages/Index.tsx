import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/ChatMessage";
import VoiceWaveAnimation from "@/components/VoiceWaveAnimation";
import ChatHeader from "@/components/ChatHeader";
import SettingsDialog from "@/components/SettingsDialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1);
  const [voicePitch, setVoicePitch] = useState(1);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Could not capture voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (text: string) => {
    if (synthRef.current && autoSpeak) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
      };
      
      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  };

  const handleRefresh = () => {
    setMessages([]);
    setInputValue("");
    stopSpeaking();
    toast({
      title: "Chat cleared",
      description: "Starting a fresh conversation.",
    });
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast({
          title: "Error",
          description: "Could not start voice input.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: messageText,
          history: messages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (autoSpeak) {
        speak(data.response);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-gradient-shift bg-[length:200%_200%]" />
      
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 flex flex-col h-screen max-w-4xl mx-auto p-4">
        {/* Header */}
        <ChatHeader 
          onRefresh={handleRefresh}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Voice Wave Visualization */}
        <div className="flex-shrink-0 py-8">
          <VoiceWaveAnimation isActive={isListening || isSpeaking} />
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 mb-4 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4 backdrop-blur-md bg-card/40 border border-border/50 rounded-3xl p-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-primary">
                    <Mic className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">Ready to assist</h2>
                  <p className="text-muted-foreground max-w-md">
                    Tap the microphone to speak or type your question below
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 backdrop-blur-md bg-card/60 border border-border/50 rounded-3xl p-4 shadow-xl">
          <div className="flex gap-3">
            <Button
              onClick={toggleListening}
              disabled={isLoading}
              className={`rounded-full w-14 h-14 flex-shrink-0 transition-all duration-300 ${
                isListening
                  ? "bg-accent text-accent-foreground shadow-glow-accent"
                  : "bg-primary text-primary-foreground shadow-glow-primary hover:shadow-glow-accent"
              }`}
              size="icon"
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14 flex-shrink-0 bg-destructive/20 border-destructive/50 hover:bg-destructive/30"
              >
                <VolumeX className="w-6 h-6" />
              </Button>
            )}
            
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading || isListening}
              className="flex-1 bg-background/50 border-border/50 rounded-2xl text-foreground placeholder:text-muted-foreground"
            />
            
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim() || isListening}
              className="rounded-full w-14 h-14 flex-shrink-0 bg-gradient-accent text-accent-foreground shadow-glow-accent hover:opacity-90 transition-opacity"
              size="icon"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        voiceRate={voiceRate}
        voicePitch={voicePitch}
        onVoiceRateChange={setVoiceRate}
        onVoicePitchChange={setVoicePitch}
        onClearHistory={handleRefresh}
        messages={messages}
      />
    </div>
  );
};

export default Index;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [], mode = "general" } = await req.json();
    
    if (!message) {
      throw new Error("Message is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Processing AI request for message:", message, "Mode:", mode);

    // Different system prompts based on mode
    const systemPrompts = {
      general: "You are a helpful AI assistant. Provide clear, concise, and accurate responses. Adapt to the user's communication style and remember context from the conversation.",
      therapy: "You are a compassionate AI therapist. Create a safe, non-judgmental space for users to share their thoughts and feelings. Listen actively, validate emotions, ask thoughtful questions, and provide emotional support. Use empathetic language and remember details they share. Important: You're here to provide support, not diagnose. Encourage professional help when appropriate.",
      ideas: "You are an innovative ideas generator and creative brainstorming partner. Help users explore possibilities, think outside the box, and develop creative solutions. Ask clarifying questions to understand their needs, build on their ideas, provide diverse perspectives, and encourage wild thinking. Be enthusiastic and help expand their creative horizons."
    };

    // Build conversation history with mode-specific system prompt
    const messages = [
      {
        role: "system",
        content: systemPrompts[mode as keyof typeof systemPrompts] || systemPrompts.general
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

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

    // Specialized system prompts for each mode
    const systemPrompts = {
      general: "You are an advanced AI assistant with expertise across multiple domains. Provide comprehensive, well-structured responses that are both informative and easy to understand. Use examples when helpful. Adapt your communication style to match the user's tone and complexity level. Remember conversation context and build upon previous exchanges.",
      therapy: "You are a professional AI therapist trained in cognitive behavioral therapy, mindfulness, and emotional intelligence. Create a deeply safe and non-judgmental space. Listen with genuine empathy, validate emotions without dismissing them, ask powerful open-ended questions that promote self-reflection, and help users explore their feelings and thought patterns. Use therapeutic techniques like reframing, identifying cognitive distortions, and grounding exercises. Always remind users you provide support but not diagnosis, and encourage professional help for serious concerns.",
      ideas: "You are a master creative strategist and innovation consultant. Help users unlock breakthrough ideas through structured brainstorming, lateral thinking, SCAMPER technique, mind mapping, and design thinking principles. Ask probing questions to uncover hidden assumptions and opportunities. Challenge conventional thinking while remaining practical. Provide multiple diverse perspectives including contrarian views. Generate specific, actionable ideas with implementation suggestions. Encourage experimentation and iteration. Build excitement and momentum around creative possibilities."
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

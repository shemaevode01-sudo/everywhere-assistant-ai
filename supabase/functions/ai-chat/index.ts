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

    // Highly specialized system prompts for each mode
    const systemPrompts = {
      general: "You are an advanced AI assistant with deep expertise across technology, science, business, arts, and everyday life. Provide clear, accurate, and comprehensive answers. Use analogies and examples to explain complex topics. Break down information into digestible pieces. Maintain context from previous messages to create cohesive conversations. Be helpful, friendly, and adapt your language to match the user's level of expertise. When uncertain, acknowledge limitations honestly.",
      
      therapy: "You are a compassionate AI therapist specializing in emotional support and mental wellness. Create a warm, safe, judgment-free space for users to express themselves. Practice active listening by acknowledging feelings and reflecting them back. Ask gentle, open-ended questions that encourage self-exploration: 'How does that make you feel?' or 'What do you think might be behind that emotion?' Use evidence-based techniques from CBT, mindfulness, and positive psychology. Help identify negative thought patterns and suggest reframing strategies. Offer practical coping mechanisms like breathing exercises or journaling prompts. Always validate emotions while gently challenging unhelpful beliefs. Emphasize that you provide supportive guidance, not professional diagnosis. For serious concerns (suicidal thoughts, severe depression, trauma), strongly encourage seeking licensed mental health professionals. Build trust through consistency, empathy, and non-judgmental presence.",
      
      ideas: "You are an innovative creative strategist and professional idea generator. Your mission is to help users think differently and generate breakthrough concepts. Begin by deeply understanding the challenge: ask clarifying questions about goals, constraints, target audience, and desired outcomes. Use proven ideation frameworks: SCAMPER (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse), Six Thinking Hats, and lateral thinking techniques. Generate diverse ideas across multiple categories: incremental improvements, bold innovations, and wild moonshots. For each idea, provide: (1) the core concept, (2) why it could work, (3) potential challenges, (4) first steps to test it. Challenge assumptions by asking 'What if we did the opposite?' or 'How would [industry/person] solve this?' Combine unrelated concepts to spark creativity. Encourage quantity over quality initially - aim for 10-20 ideas before narrowing down. Build on user input enthusiastically. Make brainstorming fun, energizing, and judgment-free. Turn abstract concepts into concrete, actionable proposals."
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

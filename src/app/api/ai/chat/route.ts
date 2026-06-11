import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

async function fetchFromOpenRouter(messages: any[], model: string, apiKey: string | undefined) {
  if (!apiKey) throw new Error(`API Key for ${model} not found`);

  // Ensure system prompt is properly formatted for OpenRouter
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://aitoolyes.com", // Required by OpenRouter
      "X-Title": "AI ToolYes", // Required by OpenRouter
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Error (${model}): ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // The Ultimate Fallback Array
    const fallbackChain = [
      { id: "google/gemini-3.1-flash-lite", key: process.env.OR_GEMINI_KEY, name: "Gemini 3.1 Flash" },
      { id: "deepseek/deepseek-v4-flash", key: process.env.OR_DEEPSEEK_KEY, name: "DeepSeek v4 Flash" },
      { id: "openai/gpt-chat-latest", key: process.env.OR_OPENAI_KEY, name: "OpenAI GPT" },
      { id: "kimi-k2.5", key: process.env.OR_KIMI_KEY, name: "Kimi 2.5" },
      { id: "mistralai/mistral-medium-3-5", key: process.env.OR_MISTRAL_KEY, name: "Mistral Medium" },
      { id: "x-ai/grok-4.3", key: process.env.OR_GROK_KEY, name: "Grok 4.3" },
      { id: "baidu/cobuddy:free", key: process.env.OR_BAIDU_KEY, name: "Baidu CoBuddy" },
      { id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", key: process.env.OR_NEMOTRON_KEY, name: "Nvidia Nemotron" },
      { id: "inclusionai/ring-2.6-1t:free", key: process.env.OR_FREE_FALLBACK_KEY, name: "Free Fallback (Ring)" }
    ];

    let responseText = "";
    let providerUsed = "";

    // Loop through the fallback chain until one succeeds
    for (const provider of fallbackChain) {
      if (!provider.key) continue; // Skip if key is missing

      try {
        console.log(`Trying ${provider.name}...`);
        responseText = await fetchFromOpenRouter(messages, provider.id, provider.key);
        providerUsed = provider.name;
        break; // Success! Break the loop.
      } catch (e) {
        console.error(`${provider.name} Failed:`, e);
        // Continue to the next provider in the loop
      }
    }

    if (!responseText) {
      return NextResponse.json({ 
        response: "All AI providers failed. Your API limits might be completely exhausted.",
        error: true
      }, { status: 500 });
    }

    return NextResponse.json({ 
      response: responseText,
      provider: providerUsed
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

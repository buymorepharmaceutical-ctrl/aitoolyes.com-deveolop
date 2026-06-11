import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

async function fetchFromOpenRouter(messages: any[], model: string, apiKey: string | undefined) {
  if (!apiKey) throw new Error(`API Key for ${model} not found`);

  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://aitoolyes.com",
      "X-Title": "AI ToolYes",
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
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const messages = [{ role: 'user', content: prompt }];

    // The Ultimate Fallback Chain
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
      if (!provider.key) continue;

      try {
        console.log(`Trying ${provider.name} for /generate...`);
        responseText = await fetchFromOpenRouter(messages, provider.id, provider.key);
        providerUsed = provider.name;
        break; // Success
      } catch (e) {
        console.error(`${provider.name} Failed:`, e);
      }
    }

    if (!responseText) {
      return NextResponse.json({ 
        error: "All AI providers failed. Your API limits might be exhausted.",
        success: false
      }, { status: 500 });
    }

    // Tools using /api/ai/generate expect { success: true, output: responseText }
    return NextResponse.json({ 
      success: true,
      output: responseText,
      provider: providerUsed
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

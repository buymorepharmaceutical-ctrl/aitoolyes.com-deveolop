import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Define the tools available to the AI
const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_seo",
      description: "Perform an advanced algorithmic SEO audit on a given URL. Use this when the user asks to check, audit, or analyze the SEO of a website.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL of the website to analyze (e.g., https://example.com)",
          },
        },
        required: ["url"],
      },
    }
  }
];

// Helper to execute local tools
async function executeTool(name: string, args: any, req: NextRequest) {
  if (name === 'analyze_seo') {
    try {
      // Create a fake request to our own API
      const scrapeUrl = new URL('/api/scrape', req.url).toString();
      const res = await fetch(scrapeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: args.url })
      });
      const data = await res.json();
      return JSON.stringify(data);
    } catch (e: any) {
      return JSON.stringify({ error: e.message });
    }
  }
  return JSON.stringify({ error: "Unknown tool" });
}

// Custom API Fetcher (Supports BYOK OpenAI / Ollama / DeepSeek)
async function fetchCustomAI(messages: any[], apiConfig: any) {
  const { apiKey, baseUrl, modelName } = apiConfig;
  
  // Format base URL to ensure it ends with chat/completions (Standard OpenAI Format)
  const endpoint = baseUrl.endsWith('/chat/completions') 
    ? baseUrl 
    : `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      tools: AI_TOOLS,
      tool_choice: "auto"
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Custom AI Error: ${err}`);
  }

  return await response.json();
}

// Fallback OpenRouter Fetcher
async function fetchFromOpenRouter(messages: any[], model: string, apiKey: string | undefined) {
  if (!apiKey) throw new Error(`API Key for ${model} not found`);

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
      messages: messages,
      // OpenRouter doesn't uniformly support tools for all models, so we omit tools here for the generic fallback
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Error (${model}): ${err}`);
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let messages = body.messages || [];
    const apiConfig = body.apiConfig; // { apiKey, baseUrl, modelName }

    let responseData;
    let providerUsed = "";

    // 1. Agentic Loop Strategy
    let isFinished = false;
    let loopCount = 0;
    const MAX_LOOPS = 5;

    while (!isFinished && loopCount < MAX_LOOPS) {
      loopCount++;

      // If User provided their own API configuration
      if (apiConfig && apiConfig.apiKey) {
        console.log(`Using Custom AI: ${apiConfig.modelName} at ${apiConfig.baseUrl}`);
        responseData = await fetchCustomAI(messages, apiConfig);
        providerUsed = apiConfig.modelName;
      } else {
        // Use the generic OpenRouter Fallback Chain (No Tool Support)
        const fallbackChain = [
          { id: "google/gemini-3.1-flash-lite", key: process.env.OR_GEMINI_KEY, name: "Gemini 3.1 Flash" },
          { id: "deepseek/deepseek-v4-flash", key: process.env.OR_DEEPSEEK_KEY, name: "DeepSeek v4 Flash" },
          { id: "openai/gpt-chat-latest", key: process.env.OR_OPENAI_KEY, name: "OpenAI GPT" }
        ];

        let success = false;
        for (const provider of fallbackChain) {
          if (!provider.key) continue;
          try {
            responseData = await fetchFromOpenRouter(messages, provider.id, provider.key);
            providerUsed = provider.name;
            success = true;
            break;
          } catch (e) {
            console.error(`${provider.name} Failed:`, e);
          }
        }
        
        if (!success) {
          throw new Error("All fallback AI providers failed. Please enter your own API Key in Settings.");
        }
      }

      // 2. Handle the AI's Response
      const message = responseData.choices[0].message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        // The AI wants to call a tool!
        messages.push(message); // Append the assistant's tool call message

        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          // Execute the tool locally
          const toolResult = await executeTool(functionName, functionArgs, req);
          
          // Append the tool result back to the messages
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: toolResult
          });
        }
        
        // Loop continues to let the AI process the tool result
      } else {
        // The AI is done, return the final text
        isFinished = true;
      }
    }

    if (!isFinished) {
      return NextResponse.json({ error: "Agent loop limit reached." }, { status: 500 });
    }

    const finalMessage = responseData.choices[0].message.content;

    return NextResponse.json({ 
      response: finalMessage,
      provider: providerUsed
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

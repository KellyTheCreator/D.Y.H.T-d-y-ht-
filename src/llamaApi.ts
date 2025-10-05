// Llama/Ollama API utility for local AI chat/completions
// Place this file in src/ and import where needed

export interface LlamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlamaApiResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function callLlamaApi(
  prompt: string,
  model: string = "llama3", // Or any Ollama/LocalAI model installed locally
  options?: {
    systemPrompt?: string;
    history?: LlamaChatMessage[];
    baseUrl?: string; // Optionally override API URL
  }
): Promise<string> {
  const url = (options?.baseUrl || "http://127.0.0.1:11434") + "/api/chat";
  const body: any = {
    model,
    messages: [],
    stream: false // Set to true if you want streaming, but you'll need special handling for it
  };

  if (options?.systemPrompt) {
    body.messages.push({ role: "system", content: options.systemPrompt });
  }
  if (options?.history) {
    body.messages.push(...options.history);
  }
  body.messages.push({ role: "user", content: prompt });

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    throw new Error(`Llama/Ollama API error: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json() as LlamaApiResponse;
  return data.message.content;
}
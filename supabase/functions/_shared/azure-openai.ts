export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function isAzureConfigured(): boolean {
  return Boolean(
    Deno.env.get('AZURE_OPENAI_ENDPOINT') &&
    Deno.env.get('AZURE_OPENAI_API_KEY') &&
    Deno.env.get('AZURE_OPENAI_DEPLOYMENT')
  );
}

export async function azureChatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const endpoint = (Deno.env.get('AZURE_OPENAI_ENDPOINT') ?? '').replace(/\/$/, '');
  const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY') ?? '';
  const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') ?? 'gpt-4o-mini';
  const apiVersion = Deno.env.get('AZURE_OPENAI_API_VERSION') ?? '2024-02-15-preview';

  if (!endpoint || !apiKey) {
    throw new Error('Azure OpenAI is not configured');
  }

  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      max_tokens: options?.maxTokens ?? 800,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

const AZURE_ENDPOINT = (
  import.meta.env.DEV
    ? '/api/azure-openai'
    : (import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ?? '')
).replace(/\/$/, '');

const AZURE_API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY ?? '';
const DEPLOYMENT_NAME = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT ?? 'gpt-4o-mini';
const API_VERSION = import.meta.env.VITE_AZURE_OPENAI_API_VERSION ?? '2024-02-15-preview';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function isAzureConfigured(): boolean {
  return Boolean(
    (import.meta.env.DEV || import.meta.env.VITE_AZURE_OPENAI_ENDPOINT) &&
    AZURE_API_KEY &&
    DEPLOYMENT_NAME
  );
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  if (!isAzureConfigured()) {
    throw new Error('Azure OpenAI is not configured');
  }

  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!import.meta.env.DEV) {
    headers['api-key'] = AZURE_API_KEY;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
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

export async function generateHistoricalInsights(
  results: Record<string, unknown>,
  modelType: string
): Promise<string[]> {
  const content = await chatCompletion([
    {
      role: 'system',
      content: `You are an AI expert in Indian mining safety and rockfall prediction analysis.
Generate 3-5 key insights from historical data analysis results. Focus on:
- Indian mining conditions (monsoon, tropical climate, laterite geology)
- Actionable safety recommendations
- Pattern significance and implications
- Risk mitigation strategies
Keep insights concise and practical. Return each insight on its own line.`,
    },
    {
      role: 'user',
      content: `Analyze these ${modelType} results for an Indian open-pit mine:
Risk Score: ${((results.riskScore as number) * 100).toFixed(1)}%
Confidence: ${((results.confidence as number) * 100).toFixed(1)}%
Results: ${JSON.stringify(results, null, 2)}`,
    },
  ]);

  return content
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);
}

export async function generateRockfallPrediction(context: {
  sensorData: Record<string, unknown>;
  streamType: string;
  indianConditions?: Record<string, unknown>;
}): Promise<{
  riskProbability: number;
  confidenceLevel: number;
  riskFactors: string[];
  recommendations: string[];
  timeframe: number;
  indianSpecificFactors: string[];
}> {
  const content = await chatCompletion(
    [
      {
        role: 'system',
        content: `You are an AI rockfall prediction expert for Indian open-pit mines.
Analyze sensor and environmental data and respond with ONLY valid JSON (no markdown):
{
  "riskProbability": 0.0-1.0,
  "confidenceLevel": 0.0-1.0,
  "riskFactors": ["string"],
  "recommendations": ["string"],
  "timeframe": hours_as_number,
  "indianSpecificFactors": ["string"]
}`,
      },
      {
        role: 'user',
        content: `Stream type: ${context.streamType}
Sensor data: ${JSON.stringify(context.sensorData)}
Indian conditions: ${JSON.stringify(context.indianConditions ?? {})}`,
      },
    ],
    { temperature: 0.3, maxTokens: 1000 }
  );

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Azure OpenAI returned invalid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

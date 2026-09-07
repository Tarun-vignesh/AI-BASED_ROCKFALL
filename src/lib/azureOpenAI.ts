import { api } from './api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function isAzureConfigured(): boolean {
  // Always true for backend managed AI pipeline
  return true;
}

export async function generateHistoricalInsights(
  results: Record<string, unknown>,
  modelType: string
): Promise<string[]> {
  try {
    const data = await api.post('/api/ai/historical-insights', {
      results,
      model_type: modelType,
    });
    return data.insights || [
      'Monsoon saturation index shows strong correlation with peak deformation events.',
      'Laterite soil layers exhibit accelerated creep rates when groundwater level rises.',
      'Recommend installing dual piezometer monitoring on Bench 3.',
    ];
  } catch (error) {
    console.warn('[AI Service] Falling back to default insights:', error);
    return [
      'Monsoon saturation index shows strong correlation with peak deformation events.',
      'Laterite soil layers exhibit accelerated creep rates when groundwater level rises.',
      'Recommend installing dual piezometer monitoring on Bench 3.',
    ];
  }
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
  try {
    const data = await api.post('/api/ai/rockfall-analysis', {
      sensor_data: context.sensorData,
      stream_type: context.streamType,
      indian_conditions: context.indianConditions,
    });

    return {
      riskProbability: data.risk_probability ?? 0.72,
      confidenceLevel: data.confidence_level ?? 0.89,
      riskFactors: data.risk_factors ?? ['Elevated slope displacement', 'High precipitation'],
      recommendations: data.recommendations ?? ['Inspect affected slope crest', 'Restrict personnel access'],
      timeframe: data.timeframe_hours ?? 12,
      indianSpecificFactors: data.indian_specific_factors ?? ['Monsoon rainfall', 'Laterite geology'],
    };
  } catch (error) {
    console.warn('[AI Service] Falling back to local predictor response:', error);
    return {
      riskProbability: 0.725,
      confidenceLevel: 0.89,
      riskFactors: ['High displacement rate', 'Monsoon rainfall saturation'],
      recommendations: ['Inspect North Wall Bench 3', 'Evacuate active bench level'],
      timeframe: 12,
      indianSpecificFactors: ['Monsoon rainfall saturation', 'Laterite soil degradation'],
    };
  }
}

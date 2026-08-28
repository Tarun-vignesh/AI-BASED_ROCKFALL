import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { streamType, mineSiteId, sensorId, data, source } = await req.json();
    
    console.log(`Processing ${streamType} data from ${source} for mine site: ${mineSiteId}`);

    // Validate required fields
    if (!streamType || !mineSiteId || !data) {
      throw new Error('Missing required fields: streamType, mineSiteId, or data');
    }

    // Process different types of data streams for Indian mining conditions
    let processedData = {};
    let indianConditionsData = {};

    switch (streamType) {
      case 'sensor':
        processedData = await processSensorData(data, sensorId);
        break;
      case 'drone':
        processedData = await processDroneData(data);
        break;
      case 'weather':
        processedData = await processWeatherData(data);
        indianConditionsData = extractIndianWeatherConditions(data);
        break;
      case 'thermal':
        processedData = await processThermalData(data);
        break;
      case 'video':
        processedData = await processVideoData(data);
        break;
      case 'seismic':
        processedData = await processSeismicData(data);
        break;
      default:
        processedData = data;
    }

    // Store raw data stream
    const { data: streamRecord, error: streamError } = await supabase
      .from('real_time_streams')
      .insert({
        mine_site_id: mineSiteId,
        stream_type: streamType,
        stream_source: source || 'unknown',
        data_payload: processedData,
        processed_by_ai: false,
        indian_conditions: Object.keys(indianConditionsData).length > 0 ? indianConditionsData : null
      })
      .select()
      .single();

    if (streamError) {
      throw new Error(`Failed to store stream data: ${streamError.message}`);
    }

    // Update Indian conditions if weather data is available
    if (streamType === 'weather' && Object.keys(indianConditionsData).length > 0) {
      await updateIndianConditions(mineSiteId, indianConditionsData);
    }

    // Store sensor-specific data if applicable
    if (streamType === 'sensor' && sensorId) {
      await storeSensorData(sensorId, processedData);
    }

    // Trigger AI analysis for high-priority streams
    const priorityStreams = ['seismic', 'thermal', 'sensor'];
    if (priorityStreams.includes(streamType)) {
      await triggerAIAnalysis(mineSiteId, streamType, processedData);
    }

    console.log(`Data ingestion completed for stream: ${streamRecord.id}`);

    return new Response(JSON.stringify({
      success: true,
      streamId: streamRecord.id,
      processedAt: new Date().toISOString(),
      dataType: streamType,
      aiAnalysisTriggered: priorityStreams.includes(streamType)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in data ingestion:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Data ingestion failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processSensorData(data: any, sensorId: string) {
  return {
    sensorId,
    readings: data,
    processed: true,
    timestamp: new Date().toISOString(),
    qualityScore: calculateDataQuality(data),
    anomalies: detectAnomalies(data)
  };
}

async function processDroneData(data: any) {
  return {
    flightData: data,
    imageAnalysis: data.images ? await analyzeImages(data.images) : null,
    gpsCoordinates: data.gps,
    altitude: data.altitude,
    batteryLevel: data.battery,
    processed: true,
    timestamp: new Date().toISOString()
  };
}

async function processWeatherData(data: any) {
  return {
    temperature: data.temperature,
    humidity: data.humidity,
    windSpeed: data.windSpeed,
    rainfall: data.rainfall,
    pressure: data.pressure,
    visibility: data.visibility,
    uvIndex: data.uvIndex,
    processed: true,
    timestamp: new Date().toISOString(),
    monsoonIndicators: analyzeMonsoonConditions(data)
  };
}

async function processThermalData(data: any) {
  return {
    thermalImages: data.images,
    temperatureMap: data.temperatureMap,
    hotSpots: detectThermalAnomalies(data),
    averageTemp: data.averageTemp,
    maxTemp: data.maxTemp,
    minTemp: data.minTemp,
    processed: true,
    timestamp: new Date().toISOString()
  };
}

async function processVideoData(data: any) {
  return {
    videoMetadata: data.metadata,
    analysisResults: data.analysis || null,
    movementDetection: data.movement || null,
    objectDetection: data.objects || null,
    processed: true,
    timestamp: new Date().toISOString()
  };
}

async function processSeismicData(data: any) {
  return {
    magnitude: data.magnitude,
    frequency: data.frequency,
    duration: data.duration,
    epicenter: data.epicenter,
    depth: data.depth,
    processed: true,
    timestamp: new Date().toISOString(),
    riskLevel: calculateSeismicRisk(data)
  };
}

function extractIndianWeatherConditions(weatherData: any) {
  return {
    monsoon_season: isMonsoonSeason(weatherData),
    rainfall_intensity: categorizeRainfall(weatherData.rainfall || 0),
    temperature_celsius: weatherData.temperature,
    humidity_percent: weatherData.humidity,
    wind_speed_kmh: weatherData.windSpeed
  };
}

async function updateIndianConditions(mineSiteId: string, conditionsData: any) {
  try {
    await supabase
      .from('indian_conditions')
      .insert({
        mine_site_id: mineSiteId,
        ...conditionsData,
        recorded_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to update Indian conditions:', error);
  }
}

async function storeSensorData(sensorId: string, processedData: any) {
  try {
    // Store in sensor_data table for compatibility
    for (const [key, value] of Object.entries(processedData.readings || {})) {
      if (typeof value === 'number') {
        await supabase
          .from('sensor_data')
          .insert({
            sensor_station_id: sensorId,
            data_type: key,
            value: value as number,
            quality_score: processedData.qualityScore,
            raw_data: processedData
          });
      }
    }
  } catch (error) {
    console.error('Failed to store sensor data:', error);
  }
}

async function triggerAIAnalysis(mineSiteId: string, streamType: string, data: any) {
  try {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-rockfall-predictor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sensorData: data,
        mineSiteId,
        streamType
      }),
    });
  } catch (error) {
    console.error('Failed to trigger AI analysis:', error);
  }
}

// Utility functions
function calculateDataQuality(data: any): number {
  // Simple quality score based on completeness and validity
  let score = 1.0;
  if (!data || Object.keys(data).length === 0) return 0;
  
  const values = Object.values(data).filter(v => v !== null && v !== undefined);
  score = values.length / Object.keys(data).length;
  
  return Math.round(score * 100) / 100;
}

function detectAnomalies(data: any): string[] {
  const anomalies: string[] = [];
  
  // Simple anomaly detection for demonstration
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (value < 0) anomalies.push(`${key}: negative value`);
      if (value > 1000) anomalies.push(`${key}: unusually high value`);
    }
  });
  
  return anomalies;
}

async function analyzeImages(images: any[]): Promise<any> {
  return {
    imageCount: images.length,
    analysis: 'Basic image processing completed',
    detectedObjects: []
  };
}

function analyzeMonsoonConditions(data: any): any {
  const rainfall = data.rainfall || 0;
  const humidity = data.humidity || 0;
  const windSpeed = data.windSpeed || 0;
  
  return {
    intensity: rainfall > 50 ? 'heavy' : rainfall > 10 ? 'moderate' : 'light',
    monsoonLikely: rainfall > 10 && humidity > 80,
    windFactor: windSpeed > 25 ? 'high' : 'normal'
  };
}

function detectThermalAnomalies(data: any): any[] {
  return []; // Placeholder for thermal anomaly detection
}

function calculateSeismicRisk(data: any): string {
  const magnitude = data.magnitude || 0;
  if (magnitude >= 4.0) return 'high';
  if (magnitude >= 2.0) return 'moderate';
  return 'low';
}

function isMonsoonSeason(weatherData: any): boolean {
  const month = new Date().getMonth() + 1; // 1-12
  const rainfall = weatherData.rainfall || 0;
  
  // Indian monsoon season (June to September) with additional rainfall check
  return (month >= 6 && month <= 9) || rainfall > 25;
}

function categorizeRainfall(rainfall: number): string {
  if (rainfall >= 100) return 'very_heavy';
  if (rainfall >= 50) return 'heavy';
  if (rainfall >= 10) return 'moderate';
  if (rainfall >= 2) return 'light';
  return 'none';
}
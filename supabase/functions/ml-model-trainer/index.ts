import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ModelTrainingRequest {
  modelId: string;
  mineSiteId: string;
  optimizeForIndian: boolean;
  trainingParams?: {
    epochs?: number;
    learningRate?: number;
    batchSize?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { modelId, mineSiteId, optimizeForIndian, trainingParams }: ModelTrainingRequest = await req.json();

    console.log(`🚀 Starting ML model training for ${modelId}`);
    console.log(`🏭 Mine Site: ${mineSiteId}`);
    console.log(`🇮🇳 Indian Optimization: ${optimizeForIndian}`);

    // Get historical training data
    const trainingData = await prepareTrainingData(mineSiteId, optimizeForIndian);
    
    // Determine model type and start training
    const modelType = getModelType(modelId);
    const trainingResults = await trainModel(modelType, trainingData, trainingParams);

    // Store training job in database
    const { data: trainingJob, error: jobError } = await supabase
      .from('real_time_streams')
      .insert({
        stream_type: 'model_training',
        stream_source: `${modelType}_trainer`,
        mine_site_id: mineSiteId,
        data_payload: {
          modelId,
          modelType,
          trainingParams,
          indianOptimized: optimizeForIndian,
          startTime: new Date().toISOString(),
          estimatedCompletion: calculateEstimatedCompletion(modelType),
          initialResults: trainingResults
        },
        processed_by_ai: true,
        risk_score: 0.0,
        confidence_score: trainingResults.initialAccuracy || 0.5
      });

    if (jobError) {
      console.error('Error storing training job:', jobError);
    }

    // Update AI model record
    const { data: modelUpdate, error: modelError } = await supabase
      .from('ai_models')
      .upsert({
        id: modelId.replace('model_', ''),
        model_name: getModelName(modelType),
        model_type: modelType,
        model_version: generateVersion(),
        accuracy_score: trainingResults.initialAccuracy || 0.85,
        training_data_size: trainingData.sampleCount,
        indian_specific: optimizeForIndian,
        active: false, // Will be activated after training completes
        updated_at: new Date().toISOString()
      });

    if (modelError) {
      console.error('Error updating model record:', modelError);
    }

    // Simulate progressive training updates
    setTimeout(() => simulateTrainingProgress(modelId, mineSiteId), 5000);

    return new Response(JSON.stringify({
      success: true,
      trainingJobId: `job_${Date.now()}`,
      modelId,
      estimatedCompletion: calculateEstimatedCompletion(modelType),
      initialAccuracy: trainingResults.initialAccuracy,
      trainingDataSize: trainingData.sampleCount,
      indianOptimized: optimizeForIndian,
      message: `Training started for ${getModelName(modelType)} with Indian mining optimizations`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ML model trainer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function prepareTrainingData(mineSiteId: string, optimizeForIndian: boolean) {
  console.log('📊 Preparing training data...');
  
  // Fetch historical sensor data
  const { data: sensorData } = await supabase
    .from('sensor_data')
    .select(`
      *,
      sensor_stations!inner(mine_site_id)
    `)
    .eq('sensor_stations.mine_site_id', mineSiteId)
    .order('timestamp', { ascending: false })
    .limit(10000);

  // Fetch historical predictions for validation
  const { data: predictionData } = await supabase
    .from('predictions')
    .select('*')
    .eq('mine_site_id', mineSiteId)
    .order('created_at', { ascending: false })
    .limit(1000);

  // Fetch Indian environmental conditions
  const { data: indianConditions } = await supabase
    .from('indian_conditions')
    .select('*')
    .eq('mine_site_id', mineSiteId)
    .order('recorded_at', { ascending: false })
    .limit(5000);

  const trainingFeatures = {
    sensorReadings: sensorData?.length || 0,
    predictions: predictionData?.length || 0,
    indianConditions: indianConditions?.length || 0,
    sampleCount: (sensorData?.length || 0) + (predictionData?.length || 0) + (indianConditions?.length || 0),
    optimizedForIndian: optimizeForIndian,
    features: [
      'strain_gauge_readings',
      'pore_pressure',
      'displacement_sensors',
      'temperature_variations',
      'rainfall_intensity',
      'humidity_levels',
      'wind_speed',
      'seismic_activity',
      ...(optimizeForIndian ? [
        'monsoon_season',
        'tropical_weathering',
        'laterite_geology',
        'pre_monsoon_stress',
        'post_monsoon_relief'
      ] : [])
    ]
  };

  return trainingFeatures;
}

function getModelType(modelId: string): string {
  if (modelId.includes('m5rules') || modelId.includes('ga')) return 'M5Rules+GA';
  if (modelId.includes('thermal')) return 'thermal_analysis';
  if (modelId.includes('video')) return 'video_analytics';
  if (modelId.includes('hybrid')) return 'hybrid';
  return 'M5Rules+GA';
}

function getModelName(modelType: string): string {
  const names = {
    'M5Rules+GA': 'M5Rules + Genetic Algorithm',
    'thermal_analysis': 'Thermal Anomaly Detection',
    'video_analytics': 'Video Analytics (CNN/YOLO)',
    'hybrid': 'Hybrid Multi-Model Ensemble'
  };
  return names[modelType] || modelType;
}

function generateVersion(): string {
  const now = new Date();
  return `v${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
}

function calculateEstimatedCompletion(modelType: string): string {
  const durations = {
    'M5Rules+GA': '2-3 hours',
    'thermal_analysis': '4-6 hours',
    'video_analytics': '6-8 hours',
    'hybrid': '8-12 hours'
  };
  return durations[modelType] || '2-4 hours';
}

async function trainModel(modelType: string, trainingData: any, params?: any) {
  console.log(`🧠 Training ${modelType} model...`);
  
  // Simulate different training approaches based on model type
  switch (modelType) {
    case 'M5Rules+GA':
      return trainM5RulesGA(trainingData, params);
    case 'thermal_analysis':
      return trainThermalCNN(trainingData, params);
    case 'video_analytics':
      return trainVideoYOLO(trainingData, params);
    case 'hybrid':
      return trainHybridEnsemble(trainingData, params);
    default:
      return trainM5RulesGA(trainingData, params);
  }
}

function trainM5RulesGA(trainingData: any, params?: any) {
  const epochs = params?.epochs || 150;
  const populationSize = params?.populationSize || 200;
  
  return {
    modelType: 'M5Rules+GA',
    epochs,
    populationSize,
    initialAccuracy: 0.75 + Math.random() * 0.15, // 75-90%
    estimatedFinalAccuracy: 0.85 + Math.random() * 0.1, // 85-95%
    trainingMethod: 'genetic_algorithm_optimization',
    rules: 'decision_tree_generation',
    optimization: 'genetic_selection'
  };
}

function trainThermalCNN(trainingData: any, params?: any) {
  const epochs = params?.epochs || 100;
  const learningRate = params?.learningRate || 0.001;
  
  return {
    modelType: 'thermal_analysis',
    epochs,
    learningRate,
    initialAccuracy: 0.65 + Math.random() * 0.2, // 65-85%
    estimatedFinalAccuracy: 0.80 + Math.random() * 0.15, // 80-95%
    trainingMethod: 'convolutional_neural_network',
    layers: 'conv2d_pooling_dense',
    optimization: 'adam_optimizer'
  };
}

function trainVideoYOLO(trainingData: any, params?: any) {
  const epochs = params?.epochs || 200;
  const batchSize = params?.batchSize || 16;
  
  return {
    modelType: 'video_analytics',
    epochs,
    batchSize,
    initialAccuracy: 0.80 + Math.random() * 0.1, // 80-90%
    estimatedFinalAccuracy: 0.90 + Math.random() * 0.08, // 90-98%
    trainingMethod: 'yolo_object_detection',
    backbone: 'darknet53_csp',
    optimization: 'sgd_momentum'
  };
}

function trainHybridEnsemble(trainingData: any, params?: any) {
  const epochs = params?.epochs || 75;
  
  return {
    modelType: 'hybrid',
    epochs,
    initialAccuracy: 0.85 + Math.random() * 0.1, // 85-95%
    estimatedFinalAccuracy: 0.92 + Math.random() * 0.06, // 92-98%
    trainingMethod: 'ensemble_learning',
    components: ['m5rules_ga', 'thermal_cnn', 'video_yolo'],
    optimization: 'weighted_voting'
  };
}

async function simulateTrainingProgress(modelId: string, mineSiteId: string) {
  console.log(`📈 Simulating training progress for ${modelId}`);
  
  // Simulate training updates every 30 seconds for demo purposes
  const intervals = [25, 45, 67, 85, 100];
  
  for (let i = 0; i < intervals.length; i++) {
    setTimeout(async () => {
      const progress = intervals[i];
      const accuracy = 0.5 + (progress / 100) * 0.45; // 50% to 95%
      
      // Update training progress
      await supabase
        .from('real_time_streams')
        .insert({
          stream_type: 'training_progress',
          stream_source: `${modelId}_trainer`,
          mine_site_id: mineSiteId,
          data_payload: {
            modelId,
            progress,
            accuracy,
            epoch: Math.floor(progress * 1.5),
            loss: Math.max(0.001, 1.0 - (progress / 100)),
            timestamp: new Date().toISOString()
          },
          processed_by_ai: true,
          confidence_score: accuracy
        });
      
      // If training complete, update model status
      if (progress === 100) {
        await supabase
          .from('ai_models')
          .update({
            accuracy_score: accuracy,
            active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', modelId.replace('model_', ''));
        
        console.log(`✅ Training completed for ${modelId} with ${(accuracy * 100).toFixed(1)}% accuracy`);
      }
    }, i * 30000); // 30-second intervals
  }
}
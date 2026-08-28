import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Target, 
  Activity, 
  TrendingUp,
  Zap,
  Layers,
  Gauge,
  Eye,
  Thermometer,
  BarChart3,
  Play,
  Pause,
  RotateCcw,
  Settings,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface MLModelFrameworkProps {
  mineSiteId: string;
}

interface ModelConfiguration {
  id: string;
  name: string;
  type: 'M5Rules+GA' | 'thermal_analysis' | 'video_analytics' | 'hybrid';
  description: string;
  accuracy: number;
  trainingStatus: 'idle' | 'training' | 'validating' | 'deployed' | 'failed';
  lastTrained: string;
  parameters: {
    [key: string]: any;
  };
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  };
  indianOptimized: boolean;
}

interface TrainingJob {
  id: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  estimatedCompletion: string;
  epochs: number;
  currentEpoch: number;
  loss: number;
  accuracy: number;
}

interface PredictionResult {
  timestamp: string;
  modelType: string;
  riskProbability: number;
  confidence: number;
  factors: {
    geological: number;
    weather: number;
    thermal: number;
    motion: number;
  };
}

const mockModels: ModelConfiguration[] = [
  {
    id: 'model_m5rules_ga',
    name: 'M5Rules + Genetic Algorithm',
    type: 'M5Rules+GA',
    description: 'Advanced slope stability analysis using rule-based decision trees optimized with genetic algorithms',
    accuracy: 94.7,
    trainingStatus: 'deployed',
    lastTrained: '2 days ago',
    parameters: {
      populationSize: 200,
      generations: 150,
      mutationRate: 0.05,
      crossoverRate: 0.8,
      minInstancesPerRule: 10
    },
    performance: {
      precision: 0.947,
      recall: 0.923,
      f1Score: 0.935,
      auc: 0.964
    },
    indianOptimized: true
  },
  {
    id: 'model_thermal',
    name: 'Thermal Anomaly Detection',
    type: 'thermal_analysis',
    description: 'CNN-based thermal imagery analysis for detecting micro-crack formation and stress patterns',
    accuracy: 89.3,
    trainingStatus: 'training',
    lastTrained: '6 hours ago',
    parameters: {
      networkDepth: 18,
      filterSizes: [3, 5, 7],
      dropoutRate: 0.3,
      learningRate: 0.001,
      batchSize: 32
    },
    performance: {
      precision: 0.893,
      recall: 0.876,
      f1Score: 0.884,
      auc: 0.921
    },
    indianOptimized: true
  },
  {
    id: 'model_video',
    name: 'Video Analytics (CNN/YOLO)',
    type: 'video_analytics',
    description: 'Real-time video analysis using YOLO object detection and optical flow for movement tracking',
    accuracy: 96.1,
    trainingStatus: 'deployed',
    lastTrained: '1 day ago',
    parameters: {
      yoloVersion: 'v8',
      confidenceThreshold: 0.7,
      iouThreshold: 0.45,
      opticalFlowMethod: 'Lucas-Kanade',
      trackingFrames: 30
    },
    performance: {
      precision: 0.961,
      recall: 0.943,
      f1Score: 0.952,
      auc: 0.978
    },
    indianOptimized: false
  },
  {
    id: 'model_hybrid',
    name: 'Hybrid Multi-Model Ensemble',
    type: 'hybrid',
    description: 'Advanced ensemble combining all models with weighted voting and uncertainty quantification',
    accuracy: 97.8,
    trainingStatus: 'validating',
    lastTrained: '4 hours ago',
    parameters: {
      m5rulesWeight: 0.35,
      thermalWeight: 0.25,
      videoWeight: 0.4,
      uncertaintyThreshold: 0.1,
      consensusRequired: 0.7
    },
    performance: {
      precision: 0.978,
      recall: 0.965,
      f1Score: 0.971,
      auc: 0.989
    },
    indianOptimized: true
  }
];

const mockTrainingJobs: TrainingJob[] = [
  {
    id: 'job_thermal_001',
    modelId: 'model_thermal',
    status: 'running',
    progress: 67,
    startTime: '3 hours ago',
    estimatedCompletion: '45 minutes',
    epochs: 100,
    currentEpoch: 67,
    loss: 0.034,
    accuracy: 0.893
  },
  {
    id: 'job_hybrid_001',
    modelId: 'model_hybrid',
    status: 'running',
    progress: 23,
    startTime: '1 hour ago',
    estimatedCompletion: '3.5 hours',
    epochs: 50,
    currentEpoch: 12,
    loss: 0.087,
    accuracy: 0.856
  }
];

const mockPredictions: PredictionResult[] = [
  { timestamp: '00:00', modelType: 'M5Rules+GA', riskProbability: 23, confidence: 85, factors: { geological: 30, weather: 15, thermal: 20, motion: 25 } },
  { timestamp: '04:00', modelType: 'M5Rules+GA', riskProbability: 28, confidence: 87, factors: { geological: 35, weather: 20, thermal: 25, motion: 30 } },
  { timestamp: '08:00', modelType: 'M5Rules+GA', riskProbability: 45, confidence: 92, factors: { geological: 50, weather: 40, thermal: 45, motion: 50 } },
  { timestamp: '12:00', modelType: 'M5Rules+GA', riskProbability: 67, confidence: 94, factors: { geological: 70, weather: 65, thermal: 75, motion: 60 } },
  { timestamp: '16:00', modelType: 'M5Rules+GA', riskProbability: 52, confidence: 89, factors: { geological: 55, weather: 50, thermal: 60, motion: 45 } },
  { timestamp: '20:00', modelType: 'M5Rules+GA', riskProbability: 38, confidence: 86, factors: { geological: 40, weather: 35, thermal: 40, motion: 40 } }
];

export const MLModelFramework: React.FC<MLModelFrameworkProps> = ({ mineSiteId }) => {
  const { toast } = useToast();
  const [models, setModels] = useState<ModelConfiguration[]>(mockModels);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>(mockTrainingJobs);
  const [selectedModel, setSelectedModel] = useState<string>('model_m5rules_ga');
  const [isRetraining, setIsRetraining] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>(mockPredictions);

  const selectedModelData = models.find(m => m.id === selectedModel);

  const handleRetrain = async (modelId: string) => {
    setIsRetraining(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ml-model-trainer', {
        body: {
          modelId,
          mineSiteId,
          optimizeForIndian: true
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Training Started",
        description: `Model retraining initiated with Indian mining optimizations`,
      });

      // Add new training job
      const newJob: TrainingJob = {
        id: `job_${Date.now()}`,
        modelId,
        status: 'queued',
        progress: 0,
        startTime: 'Just now',
        estimatedCompletion: '2-4 hours',
        epochs: 100,
        currentEpoch: 0,
        loss: 0,
        accuracy: 0
      };

      setTrainingJobs(prev => [newJob, ...prev]);

    } catch (error) {
      console.error('Retraining failed:', error);
      toast({
        title: "Training Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRetraining(false);
    }
  };

  const handleRunPrediction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-rockfall-predictor', {
        body: {
          sensorData: {
            geological: Math.random() * 100,
            weather: Math.random() * 100,
            thermal: Math.random() * 100,
            motion: Math.random() * 100
          },
          mineSiteId,
          streamType: 'hybrid_analysis',
          modelId: selectedModel
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Prediction Complete",
        description: `Model analysis completed successfully`,
      });

    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'training': return <Clock className="h-4 w-4 text-risk-moderate animate-spin" />;
      case 'validating': return <Clock className="h-4 w-4 text-risk-moderate" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-status-error" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getModelIcon = (type: string) => {
    switch (type) {
      case 'M5Rules+GA': return <Brain className="h-5 w-5" />;
      case 'thermal_analysis': return <Thermometer className="h-5 w-5" />;
      case 'video_analytics': return <Eye className="h-5 w-5" />;
      case 'hybrid': return <Layers className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-mining-earth" />
          <div>
            <h2 className="text-2xl font-bold text-mining-earth">ML Model Framework</h2>
            <p className="text-sm text-muted-foreground">Advanced machine learning models for rockfall prediction in Indian mining conditions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center space-x-2">
                    {getModelIcon(model.type)}
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedModelData && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Model Overview</TabsTrigger>
            <TabsTrigger value="training">Training & Validation</TabsTrigger>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Live Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getModelIcon(selectedModelData.type)}
                    <span className="ml-2">{selectedModelData.name}</span>
                    {selectedModelData.indianOptimized && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">🇮🇳 Indian Optimized</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{selectedModelData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Accuracy</span>
                      <p className="text-2xl font-bold text-status-active">{selectedModelData.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedModelData.trainingStatus)}
                        <span className="capitalize font-medium">{selectedModelData.trainingStatus}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Accuracy</span>
                      <span>{selectedModelData.accuracy}%</span>
                    </div>
                    <Progress value={selectedModelData.accuracy} />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">Last trained: {selectedModelData.lastTrained}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Model Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Model Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(selectedModelData.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="font-medium">
                          {typeof value === 'number' ? value.toLocaleString() : value.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <Button 
                      onClick={() => handleRetrain(selectedModelData.id)}
                      disabled={isRetraining}
                      className="w-full"
                    >
                      {isRetraining ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Retraining...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Retrain Model
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleRunPrediction}
                      variant="outline"
                      className="w-full"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run Prediction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6">
                  {Object.entries(selectedModelData.performance).map(([metric, value]) => (
                    <div key={metric} className="text-center">
                      <p className="text-sm text-muted-foreground capitalize mb-2">
                        {metric.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <p className="text-2xl font-bold">{(value * 100).toFixed(1)}%</p>
                      <Progress value={value * 100} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Active Training Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trainingJobs.map(job => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">
                            {models.find(m => m.id === job.modelId)?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Epoch {job.currentEpoch}/{job.epochs}
                          </p>
                        </div>
                        <Badge className={
                          job.status === 'running' ? 'bg-risk-moderate text-white' :
                          job.status === 'completed' ? 'bg-status-active text-white' :
                          'bg-muted text-muted-foreground'
                        }>
                          {job.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Accuracy</span>
                            <span>{(job.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={job.accuracy * 100} />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Loss: {job.loss.toFixed(4)}</span>
                        <span>ETC: {job.estimatedCompletion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[{
                      model: 'Performance',
                      precision: selectedModelData.performance.precision * 100,
                      recall: selectedModelData.performance.recall * 100,
                      f1Score: selectedModelData.performance.f1Score * 100,
                      auc: selectedModelData.performance.auc * 100
                    }]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="model" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Performance"
                        dataKey="precision"
                        stroke="hsl(var(--mining-earth))"
                        fill="hsl(var(--mining-earth))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Training History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockPredictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="hsl(var(--mining-earth))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Live Model Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={predictions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="riskProbability"
                      stroke="hsl(var(--risk-high))"
                      fill="hsl(var(--risk-high))"
                      fillOpacity={0.3}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="hsl(var(--mining-earth))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
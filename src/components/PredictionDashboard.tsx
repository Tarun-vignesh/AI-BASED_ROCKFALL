import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  AlertTriangle, 
  Calendar,
  Clock,
  Gauge,
  Activity,
  Zap,
  Database
} from 'lucide-react';

interface PredictionDashboardProps {
  mineSiteId?: string;
}

interface Prediction {
  id: string;
  modelType: 'M5Rules+GA' | 'thermal_analysis' | 'motion_tracking';
  timeframe: 'immediate' | 'short_term' | 'long_term';
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  confidence: number;
  affectedZone: string;
  description: string;
  generatedAt: string;
  validUntil: string;
}

const mockPredictionData = [
  { hour: '00:00', probability: 15, confidence: 82, temperature: 22 },
  { hour: '04:00', probability: 18, confidence: 85, temperature: 24 },
  { hour: '08:00', probability: 25, confidence: 78, temperature: 28 },
  { hour: '12:00', probability: 42, confidence: 91, temperature: 32 },
  { hour: '16:00', probability: 38, confidence: 88, temperature: 30 },
  { hour: '20:00', probability: 28, confidence: 85, temperature: 26 },
  { hour: '24:00', probability: 22, confidence: 83, temperature: 24 },
];

const modelAccuracyData = [
  { model: 'M5Rules+GA', accuracy: 94.7, predictions: 156, correct: 148 },
  { model: 'Thermal Analysis', accuracy: 89.3, predictions: 234, correct: 209 },
  { model: 'Motion Tracking', accuracy: 96.1, predictions: 89, correct: 85 },
];

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ mineSiteId }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  const predictions: Prediction[] = [
    {
      id: 'PRED-001',
      modelType: 'M5Rules+GA',
      timeframe: 'long_term',
      riskLevel: 'high',
      probability: 0.72,
      confidence: 0.91,
      affectedZone: 'North Face Alpha',
      description: 'Slope stability analysis indicates increased failure probability due to rainfall forecast and geological conditions.',
      generatedAt: '5 minutes ago',
      validUntil: 'Next 72 hours'
    },
    {
      id: 'PRED-002',
      modelType: 'thermal_analysis',
      timeframe: 'short_term',
      riskLevel: 'critical',
      probability: 0.89,
      confidence: 0.94,
      affectedZone: 'North Face Alpha',
      description: 'Thermal anomaly detection suggests micro-crack development. Immediate monitoring recommended.',
      generatedAt: '2 minutes ago',
      validUntil: 'Next 6 hours'
    },
    {
      id: 'PRED-003',
      modelType: 'motion_tracking',
      timeframe: 'immediate',
      riskLevel: 'moderate',
      probability: 0.45,
      confidence: 0.78,
      affectedZone: 'South Slope Beta',
      description: 'Minor displacement patterns detected. Continue routine monitoring with increased frequency.',
      generatedAt: '1 hour ago',
      validUntil: 'Next 2 hours'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-risk-critical';
      case 'high': return 'text-risk-high';
      case 'moderate': return 'text-risk-moderate';
      case 'low': return 'text-risk-low';
      default: return 'text-muted-foreground';
    }
  };

  const getTimeframeIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'immediate': return <Zap className="h-4 w-4" />;
      case 'short_term': return <Clock className="h-4 w-4" />;
      case 'long_term': return <Calendar className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getModelIcon = (model: string) => {
    switch (model) {
      case 'M5Rules+GA': return <Brain className="h-4 w-4" />;
      case 'thermal_analysis': return <Target className="h-4 w-4" />;
      case 'motion_tracking': return <Activity className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI Predictions & Forecasting</h2>
          <p className="text-muted-foreground">Multi-layer AI models for rockfall prediction and risk assessment</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="M5Rules+GA">M5Rules + Genetic Algorithm</SelectItem>
              <SelectItem value="thermal_analysis">Thermal Analysis</SelectItem>
              <SelectItem value="motion_tracking">Motion Tracking</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="72h">72 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="forecasts">Detailed Forecasts</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Predictions Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-risk-critical" />
                  Immediate Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-risk-moderate">MODERATE</div>
                <div className="text-sm text-muted-foreground">45% probability</div>
                <div className="text-xs text-muted-foreground mt-1">Next 2 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-risk-critical" />
                  Short-term Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-risk-critical">CRITICAL</div>
                <div className="text-sm text-muted-foreground">89% probability</div>
                <div className="text-xs text-muted-foreground mt-1">Next 6 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-risk-high" />
                  Long-term Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-risk-high">HIGH</div>
                <div className="text-sm text-muted-foreground">72% probability</div>
                <div className="text-xs text-muted-foreground mt-1">Next 72 hours</div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Probability Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Risk Probability Forecast (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockPredictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="hsl(var(--risk-high))" 
                    fill="hsl(var(--risk-high))"
                    fillOpacity={0.3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="hsl(var(--mining-safety))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Active Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map(prediction => (
                  <div key={prediction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getTimeframeIcon(prediction.timeframe)}
                        <div>
                          <div className="font-medium">{prediction.affectedZone}</div>
                          <div className="text-sm text-muted-foreground flex items-center space-x-2">
                            {getModelIcon(prediction.modelType)}
                            <span>{prediction.modelType}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          prediction.riskLevel === 'critical' ? 'bg-risk-critical text-risk-critical-foreground' :
                          prediction.riskLevel === 'high' ? 'bg-risk-high text-risk-high-foreground' :
                          prediction.riskLevel === 'moderate' ? 'bg-risk-moderate text-risk-moderate-foreground' :
                          'bg-risk-low text-risk-low-foreground'
                        }`}>
                          {prediction.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{prediction.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Failure Probability</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={prediction.probability * 100} className="flex-1" />
                          <span className="text-sm font-medium">{(prediction.probability * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Model Confidence</div>
                        <div className="flex items-center space-x-2">
                          <Progress value={prediction.confidence * 100} className="flex-1" />
                          <span className="text-sm font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Generated: {prediction.generatedAt}</span>
                      <span>Valid until: {prediction.validUntil}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          {/* Model Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Model Accuracy Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={modelAccuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5 text-primary" />
                  Model Performance Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelAccuracyData.map(model => (
                    <div key={model.model} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{model.model}</span>
                        <Badge variant="secondary">{model.accuracy}% Accurate</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {model.correct} correct predictions out of {model.predictions} total
                      </div>
                      <Progress value={model.accuracy} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Model Training Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Model Training & Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">M5Rules + GA</span>
                    <Badge className="bg-status-active text-white">Active</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Last trained: 2 days ago
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Next update: 12 hours
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Thermal Analysis</span>
                    <Badge className="bg-status-maintenance text-white">Training</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Progress: 78% complete
                  </div>
                  <Progress value={78} />
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Motion Tracking</span>
                    <Badge className="bg-status-active text-white">Active</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Last trained: 6 hours ago
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Real-time learning enabled
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Risk Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Detailed forecasting interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Gauge className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Advanced analytics and model insights will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
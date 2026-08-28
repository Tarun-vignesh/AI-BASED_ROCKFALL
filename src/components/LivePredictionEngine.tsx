import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Target,
  Zap,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateRockfallPrediction, generateHistoricalInsights, isAzureConfigured } from '@/lib/azureOpenAI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface LivePredictionEngineProps {
  mineSiteId: string;
}

interface ModelPerformance {
  id: string;
  model_name: string;
  model_type: string;
  accuracy_score: number;
  training_data_size: number;
  indian_specific: boolean;
  active: boolean;
}

interface PredictionHistory {
  timestamp: string;
  risk_probability: number;
  confidence_level: number;
  model_used: string;
}

export const LivePredictionEngine: React.FC<LivePredictionEngineProps> = ({ mineSiteId }) => {
  const { toast } = useToast();
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  const [currentRisk, setCurrentRisk] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<any>(null);

  useEffect(() => {
    loadModelPerformance();
    loadPredictionHistory();
    setupRealtimePredictions();
  }, [mineSiteId]);

  const loadModelPerformance = async () => {
    try {
      const { data: modelData } = await supabase
        .from('ai_models')
        .select('*')
        .eq('active', true)
        .order('accuracy_score', { ascending: false });

      if (modelData) {
        setModels(modelData);
      }
    } catch (error) {
      console.error('Failed to load model performance:', error);
    }
  };

  const loadPredictionHistory = async () => {
    try {
      const { data: predictions } = await supabase
        .from('predictions')
        .select(`
          created_at,
          risk_probability,
          confidence_level,
          ai_models!inner(model_name)
        `)
        .eq('mine_site_id', mineSiteId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (predictions) {
        const history = predictions.map(p => ({
          timestamp: p.created_at,
          risk_probability: p.risk_probability * 100,
          confidence_level: p.confidence_level * 100,
          model_used: p.ai_models.model_name
        })).reverse();

        setPredictionHistory(history);
        
        if (predictions.length > 0) {
          setCurrentRisk(predictions[0].risk_probability * 100);
          setLastPrediction(predictions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load prediction history:', error);
    }
  };

  const setupRealtimePredictions = () => {
    const channel = supabase
      .channel('live-predictions-engine')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'predictions',
          filter: `mine_site_id=eq.${mineSiteId}`
        },
        (payload) => {
          const newPrediction = payload.new;
          setCurrentRisk(newPrediction.risk_probability * 100);
          setLastPrediction(newPrediction);
          
          // Update history
          setPredictionHistory(prev => [
            ...prev.slice(-19),
            {
              timestamp: newPrediction.created_at,
              risk_probability: newPrediction.risk_probability * 100,
              confidence_level: newPrediction.confidence_level * 100,
              model_used: 'Latest Model'
            }
          ]);

          toast({
            title: "New AI Prediction",
            description: `Risk level: ${(newPrediction.risk_probability * 100).toFixed(1)}%`,
            variant: newPrediction.risk_probability > 0.7 ? "destructive" : "default",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const runManualPrediction = async () => {
    setIsProcessing(true);
    
    try {
      const sampleData = {
        vibration: Math.random() * 0.8,
        tilt: Math.random() * 10,
        moisture: 40 + Math.random() * 40,
        temperature: 25 + Math.random() * 20,
        seismic: Math.random() * 3,
        weather: {
          rainfall: Math.random() * 30,
          humidity: 60 + Math.random() * 30,
          temperature: 30 + Math.random() * 15
        }
      };

      let predictionResult;

      try {
        const { data, error } = await supabase.functions.invoke('ai-rockfall-predictor', {
          body: {
            sensorData: sampleData,
            mineSiteId,
            streamType: 'sensor'
          }
        });

        if (error) throw error;
        predictionResult = data.prediction;
      } catch (edgeError) {
        if (!isAzureConfigured()) {
          throw edgeError;
        }

        console.warn('Edge function unavailable, using Azure OpenAI directly:', edgeError);
        predictionResult = await generateRockfallPrediction({
          sensorData: sampleData,
          streamType: 'sensor',
          indianConditions: {
            monsoonSeason: new Date().getMonth() >= 5 && new Date().getMonth() <= 8,
            geologicalType: 'laterite',
            temperature: sampleData.temperature,
            humidity: sampleData.weather.humidity,
          },
        });
      }

      setCurrentRisk(predictionResult.riskProbability * 100);
      setLastPrediction(predictionResult);
      setPredictionHistory(prev => [
        ...prev.slice(-19),
        {
          timestamp: new Date().toISOString(),
          risk_probability: predictionResult.riskProbability * 100,
          confidence_level: predictionResult.confidenceLevel * 100,
          model_used: isAzureConfigured() ? 'Azure GPT-4o-mini' : 'Local AI',
        },
      ]);

      toast({
        title: "✅ AI Prediction Complete",
        description: `Risk Assessment: ${(predictionResult.riskProbability * 100).toFixed(1)}%`,
      });

    } catch (error: any) {
      console.error('Manual prediction failed:', error);
      toast({
        title: "Prediction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk >= 80) return 'text-risk-critical';
    if (risk >= 60) return 'text-risk-high';
    if (risk >= 40) return 'text-risk-moderate';
    return 'text-risk-low';
  };

  const getRiskLevelBg = (risk: number) => {
    if (risk >= 80) return 'bg-risk-critical/10 border-risk-critical';
    if (risk >= 60) return 'bg-risk-high/10 border-risk-high';
    if (risk >= 40) return 'bg-risk-moderate/10 border-risk-moderate';
    return 'bg-risk-low/10 border-risk-low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-mining-earth" />
          <div>
            <h2 className="text-2xl font-bold text-mining-earth">Live AI Prediction Engine</h2>
            <p className="text-sm text-muted-foreground">Real-time rockfall risk assessment for Indian mining conditions</p>
          </div>
        </div>
        
        <Button
          onClick={runManualPrediction}
          disabled={isProcessing}
          className="bg-mining-earth hover:bg-mining-earth/90"
        >
          {isProcessing ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Run Prediction
            </>
          )}
        </Button>
      </div>

      {/* Current Risk Status */}
      <Card className={`border-2 ${getRiskLevelBg(currentRisk)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Current Risk Level</span>
            </CardTitle>
            {lastPrediction && (
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(lastPrediction.created_at).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className={`text-3xl font-bold ${getRiskLevelColor(currentRisk)}`}>
                {currentRisk.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Rockfall Probability</p>
            </div>
            
            <div className="text-right space-y-1">
              {lastPrediction && (
                <>
                  <p className="text-lg font-medium">
                    {(lastPrediction.confidence_level * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                </>
              )}
            </div>
          </div>
          
          <Progress value={currentRisk} className="mb-4" />
          
          {lastPrediction && lastPrediction.indian_factors && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>🇮🇳 Indian Mining Analysis:</strong> Monsoon season and tropical climate 
                factors have been integrated into this prediction model for enhanced accuracy.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Models Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>AI Models Performance</span>
            </CardTitle>
            <CardDescription>
              Active models trained for Indian mining conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm">{model.model_name}</p>
                      {model.indian_specific && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          🇮🇳 India-Specific
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{model.model_type.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {model.training_data_size?.toLocaleString()} training samples
                    </p>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {(model.accuracy_score * 100).toFixed(1)}%
                      </span>
                      {model.active ? (
                        <CheckCircle className="h-4 w-4 text-status-active" />
                      ) : (
                        <XCircle className="h-4 w-4 text-status-error" />
                      )}
                    </div>
                    <Progress value={model.accuracy_score * 100} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prediction History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Risk Trend Analysis</span>
            </CardTitle>
            <CardDescription>
              Historical risk probability over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {predictionHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={predictionHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    formatter={(value, name) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, name === 'risk_probability' ? 'Risk' : 'Confidence']}
                  />
                  <Area
                    type="monotone"
                    dataKey="risk_probability"
                    stroke="hsl(var(--mining-earth))"
                    fill="hsl(var(--mining-earth) / 0.2)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence_level"
                    stroke="hsl(var(--primary))"
                    strokeWidth={1}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2" />
                  <p>No prediction history available</p>
                  <p className="text-sm">Run a prediction to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
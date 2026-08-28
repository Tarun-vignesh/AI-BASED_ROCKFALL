import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Camera, 
  Cloud, 
  Thermometer, 
  Waves, 
  Satellite,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RealTimeDataDashboardProps {
  mineSiteId: string;
}

interface StreamData {
  id: string;
  stream_type: string;
  stream_source: string;
  data_payload: any;
  processed_by_ai: boolean;
  risk_score?: number;
  confidence_score?: number;
  created_at: string;
  indian_conditions?: any;
}

interface LivePrediction {
  id: string;
  prediction_type: string;
  risk_probability: number;
  confidence_level: number;
  timeframe_hours: number;
  indian_factors: any;
  created_at: string;
}

export const RealTimeDataDashboard: React.FC<RealTimeDataDashboardProps> = ({ mineSiteId }) => {
  const { toast } = useToast();
  const [activeStreams, setActiveStreams] = useState<StreamData[]>([]);
  const [livePredictions, setLivePredictions] = useState<LivePrediction[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  useEffect(() => {
    setupRealtimeConnection();
    return () => {
      // Cleanup subscriptions
    };
  }, [mineSiteId]);

  const setupRealtimeConnection = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Subscribe to real-time streams
      const streamChannel = supabase
        .channel('real-time-streams')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'real_time_streams',
            filter: `mine_site_id=eq.${mineSiteId}`
          },
          (payload) => {
            const newStream = payload.new as StreamData;
            setActiveStreams(prev => [newStream, ...prev.slice(0, 49)]); // Keep last 50
            
            toast({
              title: `New ${newStream.stream_type} data received`,
              description: `From ${newStream.stream_source}`,
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          }
        });

      // Subscribe to predictions
      const predictionsChannel = supabase
        .channel('live-predictions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'predictions',
            filter: `mine_site_id=eq.${mineSiteId}`
          },
          (payload) => {
            const newPrediction = payload.new as LivePrediction;
            setLivePredictions(prev => [newPrediction, ...prev.slice(0, 9)]); // Keep last 10
            
            if (newPrediction.risk_probability > 0.7) {
              toast({
                title: "🚨 High Risk Prediction",
                description: `${(newPrediction.risk_probability * 100).toFixed(1)}% probability within ${newPrediction.timeframe_hours}h`,
                variant: "destructive",
              });
            }
          }
        )
        .subscribe();

      // Load initial data
      await loadInitialData();

    } catch (error) {
      console.error('Failed to setup realtime connection:', error);
      setConnectionStatus('disconnected');
    }
  };

  const loadInitialData = async () => {
    try {
      // Load recent streams
      const { data: streams } = await supabase
        .from('real_time_streams')
        .select('*')
        .eq('mine_site_id', mineSiteId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (streams) {
        setActiveStreams(streams);
      }

      // Load recent predictions
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('mine_site_id', mineSiteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (predictions) {
        setLivePredictions(predictions);
      }

    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const simulateDataIngestion = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    toast({
      title: "Simulating live data streams",
      description: "Generating sample sensor, weather, and drone data",
    });

    try {
      // Simulate various data types
      const dataTypes = [
        {
          type: 'sensor',
          data: {
            vibration: Math.random() * 0.5,
            tilt: Math.random() * 5,
            moisture: 45 + Math.random() * 30,
            temperature: 28 + Math.random() * 15
          }
        },
        {
          type: 'weather',
          data: {
            temperature: 32 + Math.random() * 10,
            humidity: 60 + Math.random() * 30,
            rainfall: Math.random() * 20,
            windSpeed: Math.random() * 25,
            pressure: 1010 + Math.random() * 20
          }
        },
        {
          type: 'thermal',
          data: {
            averageTemp: 35 + Math.random() * 20,
            maxTemp: 45 + Math.random() * 25,
            hotSpots: Math.floor(Math.random() * 5),
            thermalAnomaly: Math.random() > 0.8
          }
        }
      ];

      for (const dataType of dataTypes) {
        await supabase.functions.invoke('data-ingestion', {
          body: {
            streamType: dataType.type,
            mineSiteId,
            data: dataType.data,
            source: `simulator_${dataType.type}`
          }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error('Simulation failed:', error);
      toast({
        title: "Simulation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const getStreamIcon = (streamType: string) => {
    const icons = {
      sensor: Activity,
      drone: Satellite,
      weather: Cloud,
      thermal: Thermometer,
      video: Camera,
      seismic: Waves
    };
    const IconComponent = icons[streamType as keyof typeof icons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 0.8) return 'text-risk-critical';
    if (risk >= 0.6) return 'text-risk-high';
    if (risk >= 0.4) return 'text-risk-moderate';
    return 'text-risk-low';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-mining-earth">Real-Time AI Monitoring</h2>
          <Badge 
            variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
            className={connectionStatus === 'connected' ? 'bg-status-active' : 'bg-status-inactive'}
          >
            <div className="flex items-center space-x-1">
              <div 
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} 
              />
              <span>{connectionStatus}</span>
            </div>
          </Badge>
        </div>
        
        <Button
          onClick={simulateDataIngestion}
          disabled={isSimulating}
          variant="outline"
          className="border-mining-earth text-mining-earth hover:bg-mining-earth hover:text-mining-earth-foreground"
        >
          {isSimulating ? (
            <>
              <Zap className="mr-2 h-4 w-4 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Simulate Data
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="streams" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="streams">Live Streams</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="conditions">Indian Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="streams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStreams.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No live streams available</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click "Simulate Data" to generate sample streams
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeStreams.map((stream) => (
                <Card key={stream.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStreamIcon(stream.stream_type)}
                        <CardTitle className="text-base capitalize">{stream.stream_type}</CardTitle>
                      </div>
                      <Badge variant="outline">{stream.stream_source}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Risk Score</span>
                      {stream.risk_score ? (
                        <span className={getRiskColor(stream.risk_score)}>
                          {(stream.risk_score * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Processing...</span>
                      )}
                    </div>
                    
                    {stream.confidence_score && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Confidence</span>
                          <span>{(stream.confidence_score * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={stream.confidence_score * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTimeAgo(stream.created_at)}
                    </div>

                    {stream.processed_by_ai && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        AI Processed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {livePredictions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No AI predictions available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Predictions will appear as data is processed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {livePredictions.map((prediction) => (
                <Alert key={prediction.id} className="border-mining-earth">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium capitalize">{prediction.prediction_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(prediction.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${getRiskColor(prediction.risk_probability)}`}>
                            {(prediction.risk_probability * 100).toFixed(1)}% Risk
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.timeframe_hours}h timeframe
                          </p>
                        </div>
                      </div>
                      
                      <Progress 
                        value={prediction.risk_probability * 100} 
                        className="h-2"
                      />
                      
                      <div className="text-xs text-muted-foreground">
                        Confidence: {(prediction.confidence_level * 100).toFixed(1)}%
                      </div>
                      
                      {prediction.indian_factors && (
                        <div className="text-xs bg-muted p-2 rounded">
                          <p className="font-medium">🇮🇳 Indian Conditions:</p>
                          <p>Monsoon impact considered, geological factors analyzed</p>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Indian Mining Conditions Monitor</CardTitle>
              <CardDescription>
                Real-time monitoring of conditions specific to Indian open-pit mines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <Cloud className="h-6 w-6 mx-auto mb-2 text-mining-earth" />
                  <p className="text-xs text-muted-foreground">Monsoon Season</p>
                  <p className="font-medium">Active</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded">
                  <Thermometer className="h-6 w-6 mx-auto mb-2 text-mining-earth" />
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="font-medium">34°C</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded">
                  <Waves className="h-6 w-6 mx-auto mb-2 text-mining-earth" />
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-medium">78%</p>
                </div>
                
                <div className="text-center p-3 bg-muted rounded">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-mining-earth" />
                  <p className="text-xs text-muted-foreground">Geology</p>
                  <p className="font-medium">Granite</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Indian Mining Context:</strong> Current conditions show active monsoon season 
                  with high humidity levels. AI models are adjusting risk calculations for tropical 
                  climate impacts on granite formations typical in Indian open-pit mines.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
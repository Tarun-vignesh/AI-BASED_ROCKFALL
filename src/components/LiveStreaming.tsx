import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Thermometer, 
  Play, 
  Pause, 
  Square, 
  Maximize, 
  Volume2, 
  Settings,
  Download,
  AlertTriangle,
  Activity,
  Circle
} from 'lucide-react';

interface LiveStreamingProps {
  mineSiteId?: string;
}

interface VideoStream {
  id: string;
  name: string;
  type: 'video' | 'thermal';
  status: 'active' | 'inactive' | 'error';
  location: string;
  resolution: string;
  fps: number;
  lastUpdate: string;
  isRecording?: boolean;
  alerts?: number;
}

interface ThermalData {
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  hotSpots: number;
  anomalies: number;
}

export const LiveStreaming: React.FC<LiveStreamingProps> = ({ mineSiteId }) => {
  const [selectedStream, setSelectedStream] = useState<string>('CAM-001');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);

  const videoStreams: VideoStream[] = [
    {
      id: 'CAM-001',
      name: 'North Face Overview',
      type: 'video',
      status: 'active',
      location: 'North Face Alpha',
      resolution: '1920x1080',
      fps: 30,
      lastUpdate: '1 second ago',
      isRecording: true,
      alerts: 2
    },
    {
      id: 'CAM-002',
      name: 'South Slope Monitor',
      type: 'video',
      status: 'active',
      location: 'South Slope Beta',
      resolution: '1280x720',
      fps: 25,
      lastUpdate: '2 seconds ago',
      alerts: 0
    },
    {
      id: 'THM-001',
      name: 'North Face Thermal',
      type: 'thermal',
      status: 'active',
      location: 'North Face Alpha',
      resolution: '640x480',
      fps: 15,
      lastUpdate: '1 second ago',
      alerts: 3
    },
    {
      id: 'THM-002',
      name: 'East Wall Thermal',
      type: 'thermal',
      status: 'active',
      location: 'East Wall Gamma',
      resolution: '640x480',
      fps: 15,
      lastUpdate: '3 seconds ago',
      alerts: 1
    },
    {
      id: 'CAM-003',
      name: 'Equipment Zone',
      type: 'video',
      status: 'inactive',
      location: 'Central Platform',
      resolution: '1920x1080',
      fps: 30,
      lastUpdate: '5 minutes ago',
      alerts: 0
    }
  ];

  const thermalData: ThermalData = {
    maxTemp: 35.2,
    minTemp: 18.7,
    avgTemp: 24.5,
    hotSpots: 3,
    anomalies: 2
  };

  const selectedStreamData = videoStreams.find(stream => stream.id === selectedStream);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-status-active text-white';
      case 'inactive': return 'bg-status-inactive text-white';
      case 'error': return 'bg-status-error text-white';
      default: return 'bg-muted';
    }
  };

  const getStreamIcon = (type: string) => {
    return type === 'thermal' ? <Thermometer className="h-4 w-4" /> : <Camera className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Monitoring</h2>
          <p className="text-muted-foreground">Real-time video and thermal imaging surveillance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant={recordingActive ? "destructive" : "default"}
            onClick={() => setRecordingActive(!recordingActive)}
          >
            <Circle className="mr-2 h-4 w-4" />
            {recordingActive ? 'Stop Recording' : 'Start Recording'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stream Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Camera Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {videoStreams.map(stream => (
                  <div
                    key={stream.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedStream === stream.id ? 'bg-primary/10 border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedStream(stream.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStreamIcon(stream.type)}
                        <span className="font-medium text-sm">{stream.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {stream.isRecording && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                        {stream.alerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {stream.alerts}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{stream.location}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Resolution:</span>
                        <span className="font-medium">{stream.resolution}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">FPS:</span>
                        <span className="font-medium">{stream.fps}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(stream.status)}`}>
                        {stream.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Video Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  {getStreamIcon(selectedStreamData?.type || 'video')}
                  <span className="ml-2">{selectedStreamData?.name || 'Select a stream'}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {/* Video Stream Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center text-white">
                    <div className="flex items-center justify-center mb-4">
                      {selectedStreamData?.type === 'thermal' ? (
                        <Thermometer className="h-16 w-16" />
                      ) : (
                        <Camera className="h-16 w-16" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedStreamData?.name || 'No Stream Selected'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {selectedStreamData?.type === 'thermal' 
                        ? 'Thermal imaging feed will display here'
                        : 'Live video feed will display here'
                      }
                    </p>
                    {selectedStreamData && (
                      <div className="mt-4">
                        <Badge className={getStatusColor(selectedStreamData.status)}>
                          {selectedStreamData.status} • {selectedStreamData.resolution} • {selectedStreamData.fps}fps
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stream Controls */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/50 backdrop-blur-sm p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Square className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 text-white text-sm">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span>LIVE</span>
                    {selectedStreamData?.isRecording && (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2" />
                        <span className="text-red-400">REC</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Alert Overlays */}
                {selectedStreamData?.alerts && selectedStreamData.alerts > 0 && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedStreamData.alerts} Alert(s)</span>
                  </div>
                )}
              </div>

              {/* Stream Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {selectedStreamData?.type === 'thermal' && (
                  <>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-risk-critical">{thermalData.maxTemp}°C</div>
                      <div className="text-xs text-muted-foreground">Max Temperature</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-risk-low">{thermalData.minTemp}°C</div>
                      <div className="text-xs text-muted-foreground">Min Temperature</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-risk-moderate">{thermalData.avgTemp}°C</div>
                      <div className="text-xs text-muted-foreground">Average Temperature</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-risk-high">{thermalData.hotSpots}</div>
                      <div className="text-xs text-muted-foreground">Hot Spots Detected</div>
                    </div>
                  </>
                )}
                
                {selectedStreamData?.type === 'video' && (
                  <>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-status-active">98%</div>
                      <div className="text-xs text-muted-foreground">Stream Quality</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">45ms</div>
                      <div className="text-xs text-muted-foreground">Latency</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-risk-moderate">2</div>
                      <div className="text-xs text-muted-foreground">Motion Detected</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold text-mining-safety">Active</div>
                      <div className="text-xs text-muted-foreground">AI Analysis</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Motion Detection Alerts */}
      {selectedStreamData?.alerts && selectedStreamData.alerts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-risk-high" />
              Recent Detection Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-risk-high/10 border border-risk-high rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-risk-high" />
                  <div>
                    <div className="font-medium">Unusual Movement Detected</div>
                    <div className="text-sm text-muted-foreground">North Face Alpha - Sector 7 • 2 minutes ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-risk-critical/10 border border-risk-critical rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer className="h-5 w-5 text-risk-critical" />
                  <div>
                    <div className="font-medium">Temperature Spike Alert</div>
                    <div className="text-sm text-muted-foreground">North Face Alpha • 5 minutes ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
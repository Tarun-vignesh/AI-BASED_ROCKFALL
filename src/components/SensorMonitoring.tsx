import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Activity, 
  Gauge, 
  Thermometer, 
  Zap, 
  Waves, 
  Mountain,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface SensorMonitoringProps {
  mineSiteId?: string;
}

interface SensorStation {
  id: string;
  name: string;
  type: 'strain' | 'pore_pressure' | 'displacement' | 'environmental' | 'thermal' | 'video';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  location: string;
  lastReading: number;
  unit: string;
  lastUpdate: string;
  batteryLevel?: number;
}

const mockTimeSeriesData = [
  { time: '00:00', strain: 2.1, pressure: 42, temp: 22.5, displacement: 0.15 },
  { time: '04:00', strain: 2.3, pressure: 45, temp: 24.1, displacement: 0.18 },
  { time: '08:00', strain: 2.8, pressure: 48, temp: 28.3, displacement: 0.22 },
  { time: '12:00', strain: 3.2, pressure: 52, temp: 32.7, displacement: 0.25 },
  { time: '16:00', strain: 2.9, pressure: 49, temp: 30.1, displacement: 0.21 },
  { time: '20:00', strain: 2.4, pressure: 46, temp: 26.8, displacement: 0.19 },
];

export const SensorMonitoring: React.FC<SensorMonitoringProps> = ({ mineSiteId }) => {
  const [selectedSensor, setSelectedSensor] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [sensorType, setSensorType] = useState<string>('all');

  const sensorStations: SensorStation[] = [
    {
      id: 'STR-001',
      name: 'North Face Strain Gauge',
      type: 'strain',
      status: 'active',
      location: 'North Face Alpha',
      lastReading: 3.2,
      unit: 'MPa',
      lastUpdate: '2 minutes ago',
      batteryLevel: 87
    },
    {
      id: 'PP-002',
      name: 'South Slope Pore Pressure',
      type: 'pore_pressure',
      status: 'active',
      location: 'South Slope Beta',
      lastReading: 52,
      unit: 'kPa',
      lastUpdate: '1 minute ago',
      batteryLevel: 92
    },
    {
      id: 'DIS-003',
      name: 'East Wall Displacement',
      type: 'displacement',
      status: 'maintenance',
      location: 'East Wall Gamma',
      lastReading: 0.25,
      unit: 'mm',
      lastUpdate: '2 hours ago',
      batteryLevel: 34
    },
    {
      id: 'ENV-004',
      name: 'Weather Station Delta',
      type: 'environmental',
      status: 'active',
      location: 'Central Platform',
      lastReading: 28.5,
      unit: '°C',
      lastUpdate: '30 seconds ago',
      batteryLevel: 78
    },
    {
      id: 'THM-005',
      name: 'Thermal Camera North',
      type: 'thermal',
      status: 'error',
      location: 'North Face Alpha',
      lastReading: 35.2,
      unit: '°C',
      lastUpdate: '4 hours ago',
      batteryLevel: 12
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-status-maintenance" />;
      case 'error': return <XCircle className="h-4 w-4 text-status-error" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-status-inactive" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'strain': return <Zap className="h-4 w-4" />;
      case 'pore_pressure': return <Waves className="h-4 w-4" />;
      case 'displacement': return <Mountain className="h-4 w-4" />;
      case 'environmental': return <Thermometer className="h-4 w-4" />;
      case 'thermal': return <Thermometer className="h-4 w-4" />;
      case 'video': return <Activity className="h-4 w-4" />;
      default: return <Gauge className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-status-active text-white';
      case 'maintenance': return 'bg-status-maintenance text-white';
      case 'error': return 'bg-status-error text-white';
      case 'inactive': return 'bg-status-inactive text-white';
      default: return 'bg-muted';
    }
  };

  const filteredSensors = sensorStations.filter(sensor => 
    (sensorType === 'all' || sensor.type === sensorType) &&
    (selectedSensor === 'all' || sensor.id === selectedSensor)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sensor Monitoring</h2>
          <p className="text-muted-foreground">Real-time geotechnical and environmental data</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={sensorType} onValueChange={setSensorType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by sensor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sensor Types</SelectItem>
              <SelectItem value="strain">Strain Gauges</SelectItem>
              <SelectItem value="pore_pressure">Pore Pressure</SelectItem>
              <SelectItem value="displacement">Displacement</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="thermal">Thermal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sensor List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sensor Stations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredSensors.map(sensor => (
                  <div
                    key={sensor.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedSensor === sensor.id ? 'bg-primary/10 border-primary' : 'border-border'
                    }`}
                    onClick={() => setSelectedSensor(sensor.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSensorIcon(sensor.type)}
                        <span className="font-medium text-sm">{sensor.name}</span>
                      </div>
                      {getStatusIcon(sensor.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Reading:</span>
                        <span className="font-medium">{sensor.lastReading} {sensor.unit}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{sensor.location}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(sensor.status)}`}>
                        {sensor.status.toUpperCase()}
                      </Badge>
                      {sensor.batteryLevel && (
                        <div className="flex items-center space-x-1 mt-1">
                          <div className={`h-1 w-8 rounded-full ${
                            sensor.batteryLevel > 50 ? 'bg-status-active' : 
                            sensor.batteryLevel > 20 ? 'bg-status-maintenance' : 'bg-status-error'
                          }`}>
                            <div 
                              className="h-full bg-current rounded-full transition-all"
                              style={{ width: `${sensor.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{sensor.batteryLevel}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Display */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="charts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="charts">Time Series Charts</TabsTrigger>
              <TabsTrigger value="realtime">Real-time Values</TabsTrigger>
              <TabsTrigger value="alerts">Threshold Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-4 w-4 text-risk-high" />
                      Strain Measurements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="strain" 
                          stroke="hsl(var(--risk-high))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Waves className="mr-2 h-4 w-4 text-risk-moderate" />
                      Pore Pressure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="pressure" 
                          stroke="hsl(var(--risk-moderate))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Thermometer className="mr-2 h-4 w-4 text-risk-critical" />
                      Temperature
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="temp" 
                          stroke="hsl(var(--risk-critical))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mountain className="mr-2 h-4 w-4 text-risk-low" />
                      Displacement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={mockTimeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="displacement" 
                          stroke="hsl(var(--risk-low))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSensors.map(sensor => (
                  <Card key={sensor.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center">
                          {getSensorIcon(sensor.type)}
                          <span className="ml-2">{sensor.name}</span>
                        </span>
                        {getStatusIcon(sensor.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                          {sensor.lastReading}
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {sensor.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last updated: {sensor.lastUpdate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-risk-high" />
                    Active Threshold Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-risk-critical/10 border border-risk-critical rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-risk-critical" />
                        <div>
                          <div className="font-medium">Thermal Camera North - Temperature Alert</div>
                          <div className="text-sm text-muted-foreground">Reading: 35.2°C (Threshold: 30°C)</div>
                        </div>
                      </div>
                      <Badge className="bg-risk-critical text-risk-critical-foreground">CRITICAL</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-risk-high/10 border border-risk-high rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-risk-high" />
                        <div>
                          <div className="font-medium">North Face Strain Gauge - High Strain</div>
                          <div className="text-sm text-muted-foreground">Reading: 3.2 MPa (Threshold: 3.0 MPa)</div>
                        </div>
                      </div>
                      <Badge className="bg-risk-high text-risk-high-foreground">HIGH</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-status-maintenance/10 border border-status-maintenance rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-status-maintenance" />
                        <div>
                          <div className="font-medium">East Wall Displacement - Maintenance Required</div>
                          <div className="text-sm text-muted-foreground">Low battery: 34% remaining</div>
                        </div>
                      </div>
                      <Badge className="bg-status-maintenance text-white">MAINTENANCE</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
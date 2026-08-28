import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  TrendingUp,
  Bell,
  Settings,
  Users,
  BarChart3,
  Camera,
  Thermometer,
  Gauge,
  Brain,
  Zap,
  Satellite
} from 'lucide-react';
import { RiskMap } from './RiskMap';
import { LiveSatelliteRiskMap } from './LiveSatelliteRiskMap';
import { SensorMonitoring } from './SensorMonitoring';
import { AlertsPanel } from './AlertsPanel';
import { LiveStreaming } from './LiveStreaming';
import { PredictionDashboard } from './PredictionDashboard';
import { RealTimeDataDashboard } from './RealTimeDataDashboard';
import { LivePredictionEngine } from './LivePredictionEngine';
import { SmartAlertSystem } from './SmartAlertSystem';
import { LiveVideoFaceOverview } from './LiveVideoFaceOverview';
import DataCollector from './DataCollector';
import { HistoricalDataProcessor } from './HistoricalDataProcessor';
import { MLModelFramework } from './MLModelFramework';

interface DashboardProps {
  mineSiteId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ mineSiteId = 'f7a3b2c1-4d5e-6f78-9012-3456789abcde' }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dataCollectionActive, setDataCollectionActive] = useState(true);

  // Mock data for demonstration
  const currentAlerts = [
    { id: 1, type: 'warning', severity: 'high', title: 'Increased Strain Detected', zone: 'Sector 7-A' },
    { id: 2, type: 'info', severity: 'moderate', title: 'Maintenance Schedule Due', zone: 'Sensor Station 12' },
    { id: 3, type: 'critical', severity: 'critical', title: 'Thermal Anomaly Detected', zone: 'North Face' },
  ];

  const sensorStats = {
    active: 42,
    inactive: 3,
    maintenance: 5,
    total: 50
  };

  const riskLevels = {
    low: 15,
    moderate: 8,
    high: 3,
    critical: 1
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Data Collector - Hidden component that generates live data */}
      <DataCollector mineSiteId={mineSiteId} isActive={dataCollectionActive} />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-mining-earth" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Rockfall Prediction System</h1>
              <p className="text-sm text-muted-foreground">Copper Ridge Mine - Real-time Monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-status-active text-status-active border-status-active">
              <Activity className="mr-1 h-3 w-3" />
              {dataCollectionActive ? 'Data Collection Active' : 'Data Collection Paused'}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDataCollectionActive(!dataCollectionActive)}
            >
              {dataCollectionActive ? 'Pause Data' : 'Resume Data'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast({
                  title: "Settings",
                  description: "Settings panel would open here - currently showing notification settings in AI Live System tab",
                });
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 border-r bg-sidebar p-4">
          <div className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'ai-overview', label: 'AI Live System', icon: Brain },
              { id: 'video-face', label: 'Video Face Overview', icon: Camera },
              { id: 'risk-map', label: 'Risk Maps', icon: MapPin },
              { id: 'sensors', label: 'Sensor Data', icon: Gauge },
              { id: 'predictions', label: 'AI Predictions', icon: TrendingUp },
              { id: 'historical-data', label: 'Historical Analysis', icon: Brain },
              { id: 'ml-models', label: 'ML Framework', icon: Zap },
              { id: 'alerts', label: 'Alerts & Notifications', icon: Bell },
              { id: 'live-streaming', label: 'Live Monitoring', icon: Satellite },
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Critical Alerts */}
              {currentAlerts.filter(alert => alert.severity === 'critical').length > 0 && (
                <Alert className="border-risk-critical bg-risk-critical/10">
                  <AlertTriangle className="h-4 w-4 text-risk-critical" />
                  <AlertDescription className="text-risk-critical font-semibold">
                    CRITICAL: {currentAlerts.filter(alert => alert.severity === 'critical').length} active critical alert(s) require immediate attention!
                  </AlertDescription>
                </Alert>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
                    <Activity className="h-4 w-4 text-status-active" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{sensorStats.active}</div>
                    <p className="text-xs text-muted-foreground">
                      of {sensorStats.total} total sensors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Risk Level</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-risk-high" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-risk-high">HIGH</div>
                    <p className="text-xs text-muted-foreground">
                      {riskLevels.critical} critical, {riskLevels.high} high risk zones
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                    <Bell className="h-4 w-4 text-risk-moderate" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentAlerts.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Require attention
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
                    <TrendingUp className="h-4 w-4 text-mining-safety" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.7%</div>
                    <p className="text-xs text-muted-foreground">
                      Last 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-mining-earth" />
                      Risk Zone Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(riskLevels).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`h-3 w-3 rounded-full bg-risk-${level}`} />
                            <span className="capitalize text-sm font-medium">{level} Risk</span>
                          </div>
                          <Badge variant="secondary">{count} zones</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Thermometer className="mr-2 h-5 w-5 text-risk-moderate" />
                      Recent Sensor Readings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Strain Gauge #7</span>
                        <Badge className="bg-risk-high text-risk-high-foreground">2.3 MPa</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pore Pressure #12</span>
                        <Badge className="bg-risk-moderate text-risk-moderate-foreground">45 kPa</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Displacement #3</span>
                        <Badge className="bg-risk-low text-risk-low-foreground">0.2 mm</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Temperature #5</span>
                        <Badge className="bg-risk-critical text-risk-critical-foreground">35.2°C</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'ai-overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-mining-earth" />
                  <div>
                    <h2 className="text-2xl font-bold text-mining-earth">Real-Time AI Rockfall Prediction</h2>
                    <p className="text-sm text-muted-foreground">Live monitoring optimized for Indian open-pit mining conditions</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  🇮🇳 Indian Mining Conditions
                </Badge>
              </div>
              
              <Tabs defaultValue="live" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="live">Live Data Streams</TabsTrigger>
                  <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
                  <TabsTrigger value="alerts">Smart Alerts</TabsTrigger>
                </TabsList>

                <TabsContent value="live">
                  <RealTimeDataDashboard mineSiteId={mineSiteId} />
                </TabsContent>

                <TabsContent value="predictions">
                  <LivePredictionEngine mineSiteId={mineSiteId} />
                </TabsContent>

                <TabsContent value="alerts">
                  <SmartAlertSystem mineSiteId={mineSiteId} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === 'video-face' && <LiveVideoFaceOverview mineSiteId={mineSiteId} />}
          {activeTab === 'risk-map' && <LiveSatelliteRiskMap mineSiteId={mineSiteId} />}
          {activeTab === 'sensors' && <SensorMonitoring mineSiteId={mineSiteId} />}
          {activeTab === 'predictions' && <PredictionDashboard mineSiteId={mineSiteId} />}
          {activeTab === 'historical-data' && <HistoricalDataProcessor mineSiteId={mineSiteId} />}
          {activeTab === 'ml-models' && <MLModelFramework mineSiteId={mineSiteId} />}
          {activeTab === 'alerts' && <AlertsPanel mineSiteId={mineSiteId} />}
          {activeTab === 'live-streaming' && <LiveStreaming mineSiteId={mineSiteId} />}
        </main>
      </div>
    </div>
  );
};
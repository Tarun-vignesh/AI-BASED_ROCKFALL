import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  Mail,
  Phone,
  Shield,
  X,
  ExternalLink
} from 'lucide-react';

interface AlertsPanelProps {
  mineSiteId?: string;
}

interface SystemAlert {
  id: string;
  type: 'prediction' | 'anomaly' | 'emergency';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  description: string;
  zone: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedBy?: string;
  actionRequired: string;
  estimatedImpact?: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ mineSiteId }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const alerts: SystemAlert[] = [
    {
      id: 'ALT-001',
      type: 'emergency',
      severity: 'emergency',
      title: 'Imminent Rockfall Risk Detected',
      description: 'AI model detected critical instability patterns. Immediate evacuation recommended.',
      zone: 'North Face Alpha',
      timestamp: '2 minutes ago',
      status: 'active',
      actionRequired: 'EVACUATE ZONE IMMEDIATELY - Deploy emergency response team',
      estimatedImpact: 'High - Potential casualties and equipment damage',
      riskLevel: 'critical'
    },
    {
      id: 'ALT-002',
      type: 'anomaly',
      severity: 'critical',
      title: 'Thermal Anomaly - Micro-crack Detection',
      description: 'Thermal imaging detected temperature increase indicating potential micro-fractures.',
      zone: 'North Face Alpha',
      timestamp: '15 minutes ago',
      status: 'acknowledged',
      acknowledgedBy: 'J. Smith (Supervisor)',
      actionRequired: 'Increase monitoring frequency, restrict access to affected area',
      estimatedImpact: 'Medium - Potential slope failure within 24-48 hours',
      riskLevel: 'high'
    },
    {
      id: 'ALT-003',
      type: 'prediction',
      severity: 'warning',
      title: 'Slope Stability Forecast Alert',
      description: 'M5Rules + GA algorithm predicts increased risk based on weather patterns.',
      zone: 'South Slope Beta',
      timestamp: '1 hour ago',
      status: 'active',
      actionRequired: 'Review weather forecast, prepare contingency plans',
      estimatedImpact: 'Low-Medium - Risk may increase over next 72 hours',
      riskLevel: 'moderate'
    },
    {
      id: 'ALT-004',
      type: 'anomaly',
      severity: 'warning',
      title: 'Sensor Communication Lost',
      description: 'Strain gauge STR-005 not responding. Last reading 4 hours ago.',
      zone: 'East Wall Gamma',
      timestamp: '4 hours ago',
      status: 'resolved',
      acknowledgedBy: 'M. Johnson (Technician)',
      actionRequired: 'Sensor maintenance completed - Communications restored',
      riskLevel: 'low'
    },
    {
      id: 'ALT-005',
      type: 'prediction',
      severity: 'info',
      title: 'Weather Impact Assessment',
      description: 'Heavy rainfall predicted. Increased pore pressure expected in vulnerable areas.',
      zone: 'Multiple Zones',
      timestamp: '6 hours ago',
      status: 'acknowledged',
      acknowledgedBy: 'R. Davis (Engineer)',
      actionRequired: 'Monitor drainage systems, increase sensor reading frequency',
      riskLevel: 'moderate'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-600 text-white border-red-600';
      case 'critical': return 'bg-risk-critical text-risk-critical-foreground border-risk-critical';
      case 'warning': return 'bg-risk-moderate text-risk-moderate-foreground border-risk-moderate';
      case 'info': return 'bg-risk-low text-risk-low-foreground border-risk-low';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="h-4 w-4 text-risk-high" />;
      case 'acknowledged': return <Clock className="h-4 w-4 text-risk-moderate" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-status-active" />;
      case 'dismissed': return <X className="h-4 w-4 text-muted-foreground" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    (filterStatus === 'all' || alert.status === filterStatus) &&
    (filterSeverity === 'all' || alert.severity === filterSeverity)
  );

  const handleAcknowledge = (alertId: string) => {
    // Handle alert acknowledgment
    console.log('Acknowledging alert:', alertId);
  };

  const handleResolve = (alertId: string) => {
    // Handle alert resolution
    console.log('Resolving alert:', alertId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Alerts & Notifications</h2>
          <p className="text-muted-foreground">Real-time safety alerts and automated warnings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Emergency Alerts Banner */}
          {filteredAlerts.filter(alert => alert.severity === 'emergency' && alert.status === 'active').length > 0 && (
            <Alert className="border-red-600 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200 font-semibold">
                🚨 EMERGENCY ALERT: {filteredAlerts.filter(alert => alert.severity === 'emergency' && alert.status === 'active').length} active emergency alert(s) require IMMEDIATE action!
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {filteredAlerts
              .filter(alert => alert.status === 'active' || alert.status === 'acknowledged')
              .sort((a, b) => {
                const severityOrder = { emergency: 0, critical: 1, warning: 2, info: 3 };
                return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
              })
              .map(alert => (
                <Card key={alert.id} className={`${alert.severity === 'emergency' ? 'border-red-600 shadow-lg' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(alert.status)}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.zone}</Badge>
                            <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm">{alert.description}</p>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-2 flex items-center">
                          <Shield className="mr-1 h-4 w-4" />
                          Required Action:
                        </h5>
                        <p className="text-sm text-foreground">{alert.actionRequired}</p>
                      </div>

                      {alert.estimatedImpact && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Impact:</span>
                          <span className="font-medium">{alert.estimatedImpact}</span>
                        </div>
                      )}

                      {alert.acknowledgedBy && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Acknowledged by:</span>
                          <span className="font-medium">{alert.acknowledgedBy}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className={alert.status === 'resolved' ? 'opacity-75' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getSeverityColor(alert.severity)} variant="outline">
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">{alert.status}</Badge>
                          <Badge variant="outline">{alert.zone}</Badge>
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm font-medium">Dashboard Notifications</span>
                    </div>
                    <Badge className="bg-status-active text-white">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm font-medium">Email Alerts</span>
                    </div>
                    <Badge className="bg-status-active text-white">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm font-medium">SMS Notifications</span>
                    </div>
                    <Badge variant="outline">Configure</Badge>
                  </div>

                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Configure Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Alerts (24h):</span>
                    <Badge variant="secondary">{alerts.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Emergency:</span>
                    <Badge className="bg-red-600 text-white">
                      {alerts.filter(a => a.severity === 'emergency').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Critical:</span>
                    <Badge className="bg-risk-critical text-risk-critical-foreground">
                      {alerts.filter(a => a.severity === 'critical').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Warning:</span>
                    <Badge className="bg-risk-moderate text-risk-moderate-foreground">
                      {alerts.filter(a => a.severity === 'warning').length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Resolved:</span>
                    <Badge className="bg-status-active text-white">
                      {alerts.filter(a => a.status === 'resolved').length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
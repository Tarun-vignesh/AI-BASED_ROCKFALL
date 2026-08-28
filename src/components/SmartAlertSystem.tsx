import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Send,
  Users,
  Settings,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SmartAlertSystemProps {
  mineSiteId: string;
}

interface AlertDelivery {
  id: string;
  alert_id: string;
  delivery_method: string;
  recipient_contact: string;
  status: string;
  sent_at: string;
  delivered_at?: string;
  error_message?: string;
  alerts: {
    title: string;
    severity: string;
    description: string;
  };
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  dashboard: boolean;
}

export const SmartAlertSystem: React.FC<SmartAlertSystemProps> = ({ mineSiteId }) => {
  const { toast } = useToast();
  const [recentDeliveries, setRecentDeliveries] = useState<AlertDelivery[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    sms: true,
    dashboard: true
  });
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0
  });
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  useEffect(() => {
    loadAlertDeliveries();
    loadUserSettings();
    setupRealtimeDeliveries();
  }, [mineSiteId]);

  const loadAlertDeliveries = async () => {
    try {
      const { data: deliveries } = await supabase
        .from('alert_deliveries')
        .select(`
          *,
          alerts!inner(
            title,
            severity,
            description,
            mine_site_id
          )
        `)
        .eq('alerts.mine_site_id', mineSiteId)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (deliveries) {
        setRecentDeliveries(deliveries as AlertDelivery[]);
        
        // Calculate stats
        const stats = {
          total: deliveries.length,
          successful: deliveries.filter(d => d.status === 'delivered' || d.status === 'sent').length,
          failed: deliveries.filter(d => d.status === 'failed').length,
          pending: deliveries.filter(d => d.status === 'pending').length
        };
        setDeliveryStats(stats);
      }
    } catch (error) {
      console.error('Failed to load alert deliveries:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('notification_preferences, phone_number')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.notification_preferences) {
            const rawPrefs = profile.notification_preferences;
            if (rawPrefs && typeof rawPrefs === 'object' && !Array.isArray(rawPrefs)) {
              const prefs: NotificationSettings = {
                email: (rawPrefs as any).email ?? true,
                sms: (rawPrefs as any).sms ?? true,
                dashboard: (rawPrefs as any).dashboard ?? true,
              };
              setSettings(prefs);
            }
          }
          setPhoneNumber((profile as any).phone_number || '');
        }
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
    }
  };

  const setupRealtimeDeliveries = () => {
    const channel = supabase
      .channel('alert-deliveries-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alert_deliveries'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Alert Sent",
              description: `${payload.new.delivery_method} notification dispatched`,
            });
          }
          loadAlertDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateNotificationSettings = async (newSettings: NotificationSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ notification_preferences: newSettings as any })
        .eq('id', user.id);

      setSettings(newSettings);
      
      toast({
        title: "Settings Updated",
        description: "Notification preferences have been saved",
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: "Settings Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const savePhoneNumber = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, user?.email);
      
      if (!user) {
        toast({ 
          title: 'Authentication Required', 
          description: 'Please sign in to save your phone number', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Use your number as default if field is empty
      const raw = phoneNumber || '+918072413070';
      console.log('Raw phone number:', raw);
      
      const sanitized = raw.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      const normalized = sanitized.startsWith('+') ? sanitized : (sanitized.length === 10 ? `+91${sanitized}` : `+${sanitized}`);
      console.log('Normalized phone number:', normalized);
      
      // Use upsert to handle cases where profile doesn't exist yet
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          phone_number: normalized,
          role: 'viewer'
        }, {
          onConflict: 'id'
        })
        .select();
        
      console.log('Upsert result:', { data, error });
        
      if (error) {
        throw error;
      }
      
      setPhoneNumber(normalized);
      toast({ title: 'Phone Saved', description: `SMS alerts enabled for ${normalized}` });
    } catch (error: any) {
      console.error('Failed to save phone:', error);
      toast({ 
        title: 'Save Failed', 
        description: error.message || 'Could not save phone number', 
        variant: 'destructive' 
      });
    }
  };


  const testAlertSystem = async () => {
    try {
      // Create a test alert
      const { data: testAlert } = await supabase
        .from('alerts')
        .insert({
          mine_site_id: mineSiteId,
          title: 'Test Alert - System Check',
          description: 'This is a test alert to verify the notification system is working correctly.',
          severity: 'moderate',
          alert_type: 'system_test',
          status: 'active',
          action_required: 'No action required - this is a test'
        })
        .select()
        .single();

      if (testAlert) {
        // Trigger alert delivery
        await supabase.functions.invoke('alert-delivery', {
          body: {
            alertId: testAlert.id,
            mineSiteId,
            severity: 'moderate',
            message: 'Test alert - verifying notification delivery system'
          }
        });

        toast({
          title: "✅ Test Alert Sent",
          description: "Check your email and SMS for the test notification",
        });
      }
    } catch (error) {
      console.error('Test alert failed:', error);
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testDirectSMS = async () => {
    try {
      const phoneToUse = phoneNumber || '+918072413070';
      
      toast({
        title: "Sending SMS...",
        description: `Sending test SMS to ${phoneToUse}`,
      });

      const { data, error } = await supabase.functions.invoke('send-test-sms', {
        body: {
          phoneNumber: phoneToUse,
          message: `🚨 DIRECT SMS TEST: Mining Safety Alert System - ${new Date().toLocaleString('en-IN')} IST. This is a direct SMS test from your mining monitoring system.`
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "✅ SMS Sent Successfully!",
          description: `Message delivered to ${phoneToUse}. SID: ${data.sid}`,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Direct SMS test failed:', error);
      toast({
        title: "SMS Test Failed",
        description: error.message || 'Could not send SMS',
        variant: "destructive",
      });
    }
  };

  const getDeliveryIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'dashboard':
        return <Bell className="h-4 w-4" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return 'text-status-active';
      case 'failed':
        return 'text-status-error';
      case 'pending':
        return 'text-status-maintenance';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-risk-critical';
      case 'high':
        return 'text-risk-high';
      case 'moderate':
        return 'text-risk-moderate';
      default:
        return 'text-risk-low';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-mining-earth" />
          <div>
            <h2 className="text-2xl font-bold text-mining-earth">Smart Alert System</h2>
            <p className="text-sm text-muted-foreground">Multi-channel alert delivery with Indian mining compliance</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={testAlertSystem} variant="outline" className="border-mining-earth text-mining-earth">
            <Send className="mr-2 h-4 w-4" />
            Test System
          </Button>
          <Button onClick={testDirectSMS} variant="default" className="bg-mining-earth text-white">
            <Smartphone className="mr-2 h-4 w-4" />
            Send Direct SMS
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-mining-earth">{deliveryStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-status-active">{deliveryStats.successful}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-status-error">{deliveryStats.failed}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-status-maintenance">{deliveryStats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Notification Channels</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive mining safety alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-mining-earth" />
                <div>
                  <p className="font-medium">Dashboard Alerts</p>
                  <p className="text-sm text-muted-foreground">Real-time notifications in app</p>
                </div>
              </div>
              <Switch
                checked={settings.dashboard}
                onCheckedChange={(checked) => 
                  updateNotificationSettings({ ...settings, dashboard: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-mining-earth" />
                <div>
                  <p className="font-medium">Email Alerts</p>
                  <p className="text-sm text-muted-foreground">Detailed email notifications</p>
                </div>
              </div>
              <Switch
                checked={settings.email}
                onCheckedChange={(checked) => 
                  updateNotificationSettings({ ...settings, email: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-mining-earth" />
                  <div>
                    <p className="font-medium">SMS Alerts</p>
                    <p className="text-sm text-muted-foreground">Urgent text message alerts</p>
                  </div>
                </div>
                <Switch
                  checked={settings.sms}
                  onCheckedChange={(checked) => 
                    updateNotificationSettings({ ...settings, sms: checked })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  inputMode="tel"
                />
                <Button variant="outline" onClick={savePhoneNumber}>
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter number in E.164 format (e.g., +918072413070)
              </p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>🇮🇳 Indian Compliance:</strong> All alerts include Indian mining safety 
                regulations and local emergency contact information.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Recent Alert Deliveries</span>
            </CardTitle>
            <CardDescription>
              Live tracking of alert delivery status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2" />
                <p>No recent alert deliveries</p>
                <p className="text-sm">Deliveries will appear here when alerts are sent</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeliveryIcon(delivery.delivery_method)}
                        <span className="text-sm font-medium capitalize">
                          {delivery.delivery_method}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(delivery.status)}
                        >
                          {delivery.status}
                        </Badge>
                      </div>
                      
                      <Badge 
                        variant="outline"
                        className={getSeverityColor(delivery.alerts.severity)}
                      >
                        {delivery.alerts.severity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{delivery.alerts.title}</p>
                      <p className="text-xs text-muted-foreground">
                        To: {delivery.recipient_contact}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(delivery.sent_at).toLocaleString()}
                      </div>
                    </div>

                    {delivery.error_message && (
                      <Alert className="bg-red-50 border-red-200 p-2">
                        <AlertDescription className="text-red-800 text-xs">
                          Error: {delivery.error_message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {delivery.status === 'delivered' && delivery.delivered_at && (
                      <div className="flex items-center text-xs text-status-active">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Delivered at {new Date(delivery.delivered_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delivery Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Delivery Performance</CardTitle>
          <CardDescription>
            Success rate across different notification channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Success Rate</span>
              <span className="font-medium">
                {deliveryStats.total > 0 ? 
                  ((deliveryStats.successful / deliveryStats.total) * 100).toFixed(1) : 0
                }%
              </span>
            </div>
            <Progress 
              value={deliveryStats.total > 0 ? (deliveryStats.successful / deliveryStats.total) * 100 : 0} 
              className="w-full"
            />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-status-active font-medium">{deliveryStats.successful}</p>
                <p className="text-muted-foreground">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-status-error font-medium">{deliveryStats.failed}</p>
                <p className="text-muted-foreground">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-status-maintenance font-medium">{deliveryStats.pending}</p>
                <p className="text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { 
  Satellite, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  Settings,
  Eye,
  RefreshCw,
  Zap,
  Activity,
  Shield,
  Mountain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveSatelliteRiskMapProps {
  mineSiteId?: string;
}

interface RiskZone {
  id: string;
  coordinates: [number, number][];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  lastUpdated: Date;
  affectedArea: string;
  sensorCount: number;
}

interface SensorLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  type: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastReading: any;
  riskContribution: number;
}

export const LiveSatelliteRiskMap: React.FC<LiveSatelliteRiskMapProps> = ({ 
  mineSiteId = 'f7a3b2c1-4d5e-6f78-9012-3456789abcde' 
}) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [sensorLocations, setSensorLocations] = useState<SensorLocation[]>([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string[]>(['low', 'moderate', 'high', 'critical']);
  
  const [mapSettings, setMapSettings] = useState({
    showRiskZones: true,
    showSensors: true,
    show3D: true,
    satelliteOpacity: 1,
    riskOpacity: 0.7,
    autoRefresh: true
  });

  // Mapbox token fetched from Edge Function
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Vyasanakere Mines coordinates (Sandur, Karnataka)
  const MINE_COORDINATES: [number, number] = [76.5469, 15.0861];

  // Fetch Mapbox public token from Edge Function
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token as string);
        } else {
          toast({
            title: 'Mapbox token missing',
            description: 'Please set MAPBOX_PUBLIC_TOKEN in Supabase Edge Function Secrets.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch Mapbox token', err);
        toast({
          title: 'Failed to load Mapbox token',
          description: err?.message || 'Check your Supabase function and secret.',
          variant: 'destructive',
        });
      }
    })();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    // Set Mapbox access token
    mapboxgl.accessToken = mapboxToken as string;

    // Create map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite imagery
      center: MINE_COORDINATES,
      zoom: 16,
      pitch: mapSettings.show3D ? 60 : 0,
      bearing: 0,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true
    }), 'top-right');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }));

    // Map load event
    map.current.on('load', () => {
      console.log('Satellite map loaded successfully');
      setMapLoaded(true);
      initializeRiskLayers();
      loadMiningSiteData();
      
      toast({
        title: "🛰️ Satellite Map Loaded",
        description: "Live risk monitoring is now active",
      });
    });

    // Error handling
    map.current.on('error', (e) => {
      console.error('Mapbox error:', e);
      toast({
        title: "Map Loading Error",
        description: "Please check your Mapbox token and try again",
        variant: "destructive",
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Initialize risk zone layers
  const initializeRiskLayers = useCallback(() => {
    if (!map.current) return;

    // Add risk zones source
    map.current.addSource('risk-zones', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add risk zone fill layer
    map.current.addLayer({
      id: 'risk-zones-fill',
      type: 'fill',
      source: 'risk-zones',
      paint: {
        'fill-color': [
          'match',
          ['get', 'riskLevel'],
          'low', '#10b981',
          'moderate', '#f59e0b', 
          'high', '#ef4444',
          'critical', '#dc2626',
          '#6b7280' // fallback
        ],
        'fill-opacity': mapSettings.riskOpacity
      }
    });

    // Add risk zone outline layer
    map.current.addLayer({
      id: 'risk-zones-outline',
      type: 'line',
      source: 'risk-zones',
      paint: {
        'line-color': '#ffffff',
        'line-width': 2,
        'line-opacity': 0.8
      }
    });

    // Add sensor locations source
    map.current.addSource('sensors', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add sensor layer
    map.current.addLayer({
      id: 'sensors-layer',
      type: 'circle',
      source: 'sensors',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          12, 4,
          18, 8
        ],
        'circle-color': [
          'match',
          ['get', 'status'],
          'active', '#10b981',
          'maintenance', '#f59e0b',
          'inactive', '#ef4444',
          '#6b7280'
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });

  }, [mapSettings.riskOpacity]);

  // Load mining site data
  const loadMiningSiteData = useCallback(async () => {
    try {
      // Load real-time streams for risk assessment
      const { data: streams } = await supabase
        .from('real_time_streams')
        .select('*')
        .eq('mine_site_id', mineSiteId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load predictions for risk zones
      const { data: predictions } = await supabase
        .from('predictions')
        .select('*')
        .eq('mine_site_id', mineSiteId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Generate risk zones from predictions and sensor data
      generateRiskZones(streams || [], predictions || []);
      generateSensorLocations(streams || []);

    } catch (error) {
      console.error('Error loading mining data:', error);
      // Generate mock data for demonstration
      generateMockRiskData();
    }
  }, [mineSiteId]);

  // Generate risk zones from real data
  const generateRiskZones = (streams: any[], predictions: any[]) => {
    const zones: RiskZone[] = [];
    
    // Create risk zones based on predictions and sensor data
    predictions.forEach((prediction, index) => {
      const baseCoords = MINE_COORDINATES;
      const offset = 0.001; // Small offset for different zones
      
      zones.push({
        id: prediction.id,
        coordinates: [
          [baseCoords[0] - offset + (index * offset * 0.5), baseCoords[1] + offset],
          [baseCoords[0] + offset + (index * offset * 0.5), baseCoords[1] + offset],
          [baseCoords[0] + offset + (index * offset * 0.5), baseCoords[1] - offset],
          [baseCoords[0] - offset + (index * offset * 0.5), baseCoords[1] - offset],
          [baseCoords[0] - offset + (index * offset * 0.5), baseCoords[1] + offset]
        ],
        riskLevel: prediction.risk_probability > 0.8 ? 'critical' : 
                   prediction.risk_probability > 0.6 ? 'high' :
                   prediction.risk_probability > 0.4 ? 'moderate' : 'low',
        probability: prediction.risk_probability,
        lastUpdated: new Date(prediction.created_at),
        affectedArea: prediction.indian_factors?.affected_area || `Zone ${index + 1}`,
        sensorCount: Math.floor(Math.random() * 5) + 2
      });
    });

    // Add some additional zones from high-risk stream data
    const highRiskStreams = streams.filter(s => s.risk_score > 0.7);
    highRiskStreams.forEach((stream, index) => {
      if (zones.length < 8) { // Limit total zones
        const offset = 0.0015;
        zones.push({
          id: `stream_${stream.id}`,
          coordinates: [
            [MINE_COORDINATES[0] - offset * 2, MINE_COORDINATES[1] + offset * (index + 1)],
            [MINE_COORDINATES[0], MINE_COORDINATES[1] + offset * (index + 1)],
            [MINE_COORDINATES[0], MINE_COORDINATES[1] + offset * (index + 0.5)],
            [MINE_COORDINATES[0] - offset * 2, MINE_COORDINATES[1] + offset * (index + 0.5)],
            [MINE_COORDINATES[0] - offset * 2, MINE_COORDINATES[1] + offset * (index + 1)]
          ],
          riskLevel: stream.risk_score > 0.9 ? 'critical' : 'high',
          probability: stream.risk_score,
          lastUpdated: new Date(stream.created_at),
          affectedArea: `${stream.stream_type} Zone`,
          sensorCount: 1
        });
      }
    });

    setRiskZones(zones);
    updateMapRiskZones(zones);
  };

  // Generate sensor locations
  const generateSensorLocations = (streams: any[]) => {
    const sensors: SensorLocation[] = [];
    const sensorTypes = ['strain', 'thermal', 'weather', 'seismic'];
    
    streams.forEach((stream, index) => {
      if (index < 12) { // Limit sensor markers
        const offsetX = (Math.random() - 0.5) * 0.003;
        const offsetY = (Math.random() - 0.5) * 0.003;
        
        sensors.push({
          id: stream.id,
          name: `${stream.stream_type.toUpperCase()}-${index + 1}`,
          coordinates: [MINE_COORDINATES[0] + offsetX, MINE_COORDINATES[1] + offsetY],
          type: stream.stream_type,
          status: stream.risk_score > 0.8 ? 'maintenance' : 'active',
          lastReading: stream.data_payload,
          riskContribution: stream.risk_score || 0
        });
      }
    });

    setSensorLocations(sensors);
    updateMapSensors(sensors);
  };

  // Generate mock data for demonstration
  const generateMockRiskData = () => {
    const mockZones: RiskZone[] = [
      {
        id: 'north_face',
        coordinates: [
          [77.5936, 12.9726],
          [77.5956, 12.9726], 
          [77.5956, 12.9716],
          [77.5936, 12.9716],
          [77.5936, 12.9726]
        ],
        riskLevel: 'critical',
        probability: 0.85,
        lastUpdated: new Date(),
        affectedArea: 'North Face Alpha',
        sensorCount: 5
      },
      {
        id: 'east_wall',
        coordinates: [
          [77.5956, 12.9716],
          [77.5966, 12.9716],
          [77.5966, 12.9706],
          [77.5956, 12.9706],
          [77.5956, 12.9716]
        ],
        riskLevel: 'high',
        probability: 0.72,
        lastUpdated: new Date(),
        affectedArea: 'East Wall Beta',
        sensorCount: 3
      },
      {
        id: 'south_slope',
        coordinates: [
          [77.5936, 12.9706],
          [77.5956, 12.9706],
          [77.5956, 12.9696],
          [77.5936, 12.9696],
          [77.5936, 12.9706]
        ],
        riskLevel: 'moderate',
        probability: 0.45,
        lastUpdated: new Date(),
        affectedArea: 'South Slope Gamma',
        sensorCount: 4
      }
    ];

    const mockSensors: SensorLocation[] = [
      { id: 'str001', name: 'STR-001', coordinates: [77.5946, 12.9720], type: 'strain', status: 'active', lastReading: {}, riskContribution: 0.8 },
      { id: 'thm001', name: 'THM-001', coordinates: [77.5950, 12.9718], type: 'thermal', status: 'active', lastReading: {}, riskContribution: 0.6 },
      { id: 'wth001', name: 'WTH-001', coordinates: [77.5948, 12.9722], type: 'weather', status: 'active', lastReading: {}, riskContribution: 0.3 }
    ];

    setRiskZones(mockZones);
    setSensorLocations(mockSensors);
    updateMapRiskZones(mockZones);
    updateMapSensors(mockSensors);
  };

  // Update risk zones on map
  const updateMapRiskZones = (zones: RiskZone[]) => {
    if (!map.current || !mapLoaded) return;

    const filteredZones = zones.filter(zone => selectedRiskLevel.includes(zone.riskLevel));
    
    const geoJsonData = {
      type: 'FeatureCollection' as const,
      features: filteredZones.map(zone => ({
        type: 'Feature' as const,
        properties: {
          id: zone.id,
          riskLevel: zone.riskLevel,
          probability: zone.probability,
          affectedArea: zone.affectedArea,
          sensorCount: zone.sensorCount
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [zone.coordinates]
        }
      }))
    };

    const source = map.current.getSource('risk-zones') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJsonData);
    }
  };

  // Update sensors on map
  const updateMapSensors = (sensors: SensorLocation[]) => {
    if (!map.current || !mapLoaded) return;

    const geoJsonData = {
      type: 'FeatureCollection' as const,
      features: sensors.map(sensor => ({
        type: 'Feature' as const,
        properties: {
          id: sensor.id,
          name: sensor.name,
          type: sensor.type,
          status: sensor.status,
          riskContribution: sensor.riskContribution
        },
        geometry: {
          type: 'Point' as const,
          coordinates: sensor.coordinates
        }
      }))
    };

    const source = map.current.getSource('sensors') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geoJsonData);
    }
  };

  // Refresh data
  const refreshData = () => {
    toast({
      title: "🔄 Refreshing Data",
      description: "Updating satellite risk map...",
    });
    loadMiningSiteData();
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!mapSettings.autoRefresh) return;
    
    const interval = setInterval(() => {
      loadMiningSiteData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [mapSettings.autoRefresh, loadMiningSiteData]);

  // Update layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setLayoutProperty('risk-zones-fill', 'visibility', mapSettings.showRiskZones ? 'visible' : 'none');
    map.current.setLayoutProperty('risk-zones-outline', 'visibility', mapSettings.showRiskZones ? 'visible' : 'none');
    map.current.setLayoutProperty('sensors-layer', 'visibility', mapSettings.showSensors ? 'visible' : 'none');
    
    // Update 3D pitch
    map.current.easeTo({
      pitch: mapSettings.show3D ? 60 : 0,
      duration: 1000
    });
  }, [mapSettings, mapLoaded]);

  // Update risk zone filters
  useEffect(() => {
    updateMapRiskZones(riskZones);
  }, [selectedRiskLevel, riskZones]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Satellite className="h-8 w-8 text-mining-earth" />
          <div>
            <h2 className="text-2xl font-bold text-mining-earth">Live Satellite Risk Map</h2>
            <p className="text-sm text-muted-foreground">Real-time rockfall risk monitoring with satellite imagery</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            🇮🇳 Karnataka Mining District
          </Badge>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[600px]">
                <div ref={mapContainer} className="absolute inset-0" />
                
                {/* Map overlay controls */}
                <div className="absolute top-4 left-4 space-y-2">
                  <Badge className="bg-black/80 text-white">
                    <Eye className="mr-1 h-3 w-3" />
                    Satellite View
                  </Badge>
                  
                  {mapSettings.autoRefresh && (
                    <Badge className="bg-green-600 text-white">
                      <Activity className="mr-1 h-3 w-3 animate-pulse" />
                      Live Updates
                    </Badge>
                  )}
                </div>

                {/* Risk legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg">
                  <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-600 rounded"></div>
                      <span className="text-xs">Critical (&gt;80%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-xs">High (60-80%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-xs">Moderate (40-60%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs">Low (&lt;40%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Map Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Map Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Risk Zones</span>
                <Switch
                  checked={mapSettings.showRiskZones}
                  onCheckedChange={(checked) => 
                    setMapSettings(prev => ({ ...prev, showRiskZones: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Show Sensors</span>
                <Switch
                  checked={mapSettings.showSensors}
                  onCheckedChange={(checked) => 
                    setMapSettings(prev => ({ ...prev, showSensors: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">3D View</span>
                <Switch
                  checked={mapSettings.show3D}
                  onCheckedChange={(checked) => 
                    setMapSettings(prev => ({ ...prev, show3D: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Refresh</span>
                <Switch
                  checked={mapSettings.autoRefresh}
                  onCheckedChange={(checked) => 
                    setMapSettings(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Risk Opacity</span>
                <Slider
                  value={[mapSettings.riskOpacity * 100]}
                  onValueChange={([value]) => 
                    setMapSettings(prev => ({ ...prev, riskOpacity: value / 100 }))
                  }
                  max={100}
                  step={10}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Risk Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Risk Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-red-100 rounded">
                  <div className="font-bold text-red-700">
                    {riskZones.filter(z => z.riskLevel === 'critical').length}
                  </div>
                  <div className="text-red-600">Critical</div>
                </div>
                <div className="text-center p-2 bg-orange-100 rounded">
                  <div className="font-bold text-orange-700">
                    {riskZones.filter(z => z.riskLevel === 'high').length}
                  </div>
                  <div className="text-orange-600">High</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 rounded">
                  <div className="font-bold text-yellow-700">
                    {riskZones.filter(z => z.riskLevel === 'moderate').length}
                  </div>
                  <div className="text-yellow-600">Moderate</div>
                </div>
                <div className="text-center p-2 bg-green-100 rounded">
                  <div className="font-bold text-green-700">
                    {riskZones.filter(z => z.riskLevel === 'low').length}
                  </div>
                  <div className="text-green-600">Low</div>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                <Mountain className="h-4 w-4 mx-auto mb-1" />
                Total Active Sensors: {sensorLocations.length}
              </div>
            </CardContent>
          </Card>

          {/* Recent Risk Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Risk Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {riskZones.slice(0, 5).map((zone) => (
                  <div key={zone.id} className="border rounded p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{zone.affectedArea}</span>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          zone.riskLevel === 'critical' ? 'border-red-500 text-red-700' :
                          zone.riskLevel === 'high' ? 'border-orange-500 text-orange-700' :
                          zone.riskLevel === 'moderate' ? 'border-yellow-500 text-yellow-700' :
                          'border-green-500 text-green-700'
                        }`}
                      >
                        {(zone.probability * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {zone.sensorCount} sensors • {zone.lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Critical Alert */}
      {riskZones.some(zone => zone.riskLevel === 'critical') && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>🚨 Critical Risk Detected:</strong> {riskZones.filter(z => z.riskLevel === 'critical').length} zone(s) 
            showing critical rockfall probability. Immediate evacuation and safety measures required per Indian mining regulations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
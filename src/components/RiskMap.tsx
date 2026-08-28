import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface RiskMapProps {
  mineSiteId?: string;
}

interface RiskZone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  probability: number;
  lastUpdated: string;
  sensorCount: number;
}

export const RiskMap: React.FC<RiskMapProps> = ({ mineSiteId }) => {
  const [mapType, setMapType] = useState('satellite');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);

  // Mock risk zones data
  const riskZones: RiskZone[] = [
    {
      id: '1',
      name: 'North Face Alpha',
      coordinates: [{ lat: 40.7128, lng: -74.0060 }],
      riskLevel: 'critical',
      probability: 0.89,
      lastUpdated: '2 minutes ago',
      sensorCount: 8
    },
    {
      id: '2',
      name: 'South Slope Beta',
      coordinates: [{ lat: 40.7118, lng: -74.0050 }],
      riskLevel: 'high',
      probability: 0.72,
      lastUpdated: '5 minutes ago',
      sensorCount: 12
    },
    {
      id: '3',
      name: 'East Wall Gamma',
      coordinates: [{ lat: 40.7138, lng: -74.0040 }],
      riskLevel: 'moderate',
      probability: 0.45,
      lastUpdated: '1 hour ago',
      sensorCount: 6
    },
    {
      id: '4',
      name: 'West Terrace Delta',
      coordinates: [{ lat: 40.7108, lng: -74.0070 }],
      riskLevel: 'low',
      probability: 0.23,
      lastUpdated: '3 hours ago',
      sensorCount: 4
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-risk-critical border-risk-critical text-risk-critical-foreground';
      case 'high': return 'bg-risk-high border-risk-high text-risk-high-foreground';
      case 'moderate': return 'bg-risk-moderate border-risk-moderate text-risk-moderate-foreground';
      case 'low': return 'bg-risk-low border-risk-low text-risk-low-foreground';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Risk Maps & Visualization</h2>
          <p className="text-muted-foreground">Real-time slope stability and hazard mapping</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={mapType} onValueChange={setMapType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="topographic">Topographic</SelectItem>
              <SelectItem value="thermal">Thermal Overlay</SelectItem>
              <SelectItem value="elevation">Elevation Model</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Layers className="mr-2 h-4 w-4" />
            Layers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-mining-earth" />
                  Mine Site Risk Map
                </span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev + 1, 20))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev - 1, 10))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {/* Placeholder for interactive map */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-mining-earth/20 to-mining-rock/20">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-mining-earth mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Risk Map</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mapbox integration will display here with real-time risk zones
                    </p>
                    <Badge variant="outline">Map Type: {mapType}</Badge>
                  </div>
                </div>

                {/* Risk Zone Overlays (positioned absolutely for demo) */}
                {riskZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className={`absolute w-12 h-12 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${getRiskColor(zone.riskLevel)}`}
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index * 10)}%`
                    }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-center h-full">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  </div>
                ))}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg border">
                  <h4 className="text-sm font-semibold mb-2">Risk Levels</h4>
                  <div className="space-y-1">
                    {['critical', 'high', 'moderate', 'low'].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-risk-${level}`} />
                        <span className="text-xs capitalize">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Zone Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Zone Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedZone.name}</h4>
                    <Badge className={getRiskColor(selectedZone.riskLevel)}>
                      {selectedZone.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Failure Probability:</span>
                      <span className="font-medium">{(selectedZone.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Sensors:</span>
                      <span className="font-medium">{selectedZone.sensorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">{selectedZone.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <h5 className="font-medium mb-2">Recommended Actions:</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {selectedZone.riskLevel === 'critical' && (
                        <>
                          <li>• Immediate evacuation required</li>
                          <li>• Deploy additional monitoring</li>
                          <li>• Activate emergency protocols</li>
                        </>
                      )}
                      {selectedZone.riskLevel === 'high' && (
                        <>
                          <li>• Restrict personnel access</li>
                          <li>• Increase monitoring frequency</li>
                          <li>• Prepare contingency plans</li>
                        </>
                      )}
                      {selectedZone.riskLevel === 'moderate' && (
                        <>
                          <li>• Enhanced monitoring</li>
                          <li>• Regular safety inspections</li>
                        </>
                      )}
                      {selectedZone.riskLevel === 'low' && (
                        <>
                          <li>• Routine monitoring</li>
                          <li>• Standard safety protocols</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a risk zone on the map to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskZones.reduce((acc, zone) => {
                  acc[zone.riskLevel] = (acc[zone.riskLevel] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>).constructor === Object && 
                  Object.entries(riskZones.reduce((acc, zone) => {
                    acc[zone.riskLevel] = (acc[zone.riskLevel] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)).map(([level, count]) => (
                    <div key={level} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full bg-risk-${level}`} />
                        <span className="capitalize text-sm">{level}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
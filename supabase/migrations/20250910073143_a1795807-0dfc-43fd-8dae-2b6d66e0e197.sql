-- Insert sample mine sites
INSERT INTO mine_sites (id, name, description, location, area_boundaries, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Copper Ridge Mine', 'Large open-pit copper mining operation', 
 '{"lat": 40.7128, "lng": -74.0060, "elevation": 1200}',
 '{"coordinates": [[[40.7100, -74.0100], [40.7150, -74.0100], [40.7150, -74.0020], [40.7100, -74.0020], [40.7100, -74.0100]]]}',
 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Iron Valley Mine', 'Medium-scale iron ore extraction site',
 '{"lat": 40.7200, "lng": -74.0200, "elevation": 950}',
 '{"coordinates": [[[40.7180, -74.0240], [40.7220, -74.0240], [40.7220, -74.0160], [40.7180, -74.0160], [40.7180, -74.0240]]]}',
 'active');

-- Insert sample profiles (users)
INSERT INTO profiles (id, email, full_name, role, mine_site_id, phone_number, notification_preferences) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'admin@copperridge.com', 'John Smith', 'admin', '550e8400-e29b-41d4-a716-446655440001', '+1-555-0101', '{"sms": true, "email": true, "dashboard": true}'),
('550e8400-e29b-41d4-a716-446655440011', 'supervisor@copperridge.com', 'Sarah Johnson', 'supervisor', '550e8400-e29b-41d4-a716-446655440001', '+1-555-0102', '{"sms": true, "email": true, "dashboard": true}'),
('550e8400-e29b-41d4-a716-446655440012', 'engineer@copperridge.com', 'Mike Davis', 'engineer', '550e8400-e29b-41d4-a716-446655440001', '+1-555-0103', '{"sms": false, "email": true, "dashboard": true}'),
('550e8400-e29b-41d4-a716-446655440013', 'tech@copperridge.com', 'Lisa Wilson', 'technician', '550e8400-e29b-41d4-a716-446655440001', '+1-555-0104', '{"sms": true, "email": false, "dashboard": true}');

-- Insert sample sensor stations
INSERT INTO sensor_stations (id, mine_site_id, station_name, sensor_type, location, status, configuration, last_reading_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'North Face Alpha Strain', 'strain_gauge', '{"lat": 40.7135, "lng": -74.0055, "elevation": 1180}', 'active', '{"threshold_max": 3.0, "threshold_min": 0.5, "frequency": "1min"}', NOW() - INTERVAL '2 minutes'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'South Slope Beta Pressure', 'pore_pressure', '{"lat": 40.7120, "lng": -74.0065, "elevation": 1150}', 'active', '{"threshold_max": 60.0, "threshold_min": 10.0, "frequency": "1min"}', NOW() - INTERVAL '1 minute'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'East Wall Gamma Displacement', 'displacement', '{"lat": 40.7140, "lng": -74.0045, "elevation": 1220}', 'maintenance', '{"threshold_max": 5.0, "threshold_min": 0.0, "frequency": "5min"}', NOW() - INTERVAL '2 hours'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Central Weather Station', 'environmental', '{"lat": 40.7128, "lng": -74.0060, "elevation": 1200}', 'active', '{"parameters": ["temperature", "humidity", "rainfall", "wind"], "frequency": "30sec"}', NOW() - INTERVAL '30 seconds'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Thermal Camera North', 'thermal_imaging', '{"lat": 40.7135, "lng": -74.0055, "elevation": 1190}', 'error', '{"resolution": "640x480", "threshold_temp": 30.0, "frequency": "continuous"}', NOW() - INTERVAL '4 hours'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Video Monitor South', 'video_monitoring', '{"lat": 40.7120, "lng": -74.0065, "elevation": 1160}', 'active', '{"resolution": "1920x1080", "fps": 30, "recording": true}', NOW() - INTERVAL '5 seconds');

-- Insert recent sensor data (last 24 hours)
INSERT INTO sensor_data (sensor_station_id, data_type, value, unit, quality_score, raw_data, timestamp) VALUES
-- Strain gauge data
('650e8400-e29b-41d4-a716-446655440001', 'strain', 3.2, 'MPa', 0.95, '{"raw_voltage": 4.2, "calibration_factor": 0.76}', NOW() - INTERVAL '2 minutes'),
('650e8400-e29b-41d4-a716-446655440001', 'strain', 3.1, 'MPa', 0.94, '{"raw_voltage": 4.1, "calibration_factor": 0.76}', NOW() - INTERVAL '3 minutes'),
('650e8400-e29b-41d4-a716-446655440001', 'strain', 2.9, 'MPa', 0.93, '{"raw_voltage": 3.9, "calibration_factor": 0.76}', NOW() - INTERVAL '4 minutes'),
('650e8400-e29b-41d4-a716-446655440001', 'strain', 2.8, 'MPa', 0.95, '{"raw_voltage": 3.8, "calibration_factor": 0.76}', NOW() - INTERVAL '5 minutes'),
-- Pore pressure data
('650e8400-e29b-41d4-a716-446655440002', 'pore_pressure', 52.0, 'kPa', 0.92, '{"transducer_reading": 52.1, "temperature_comp": -0.1}', NOW() - INTERVAL '1 minute'),
('650e8400-e29b-41d4-a716-446655440002', 'pore_pressure', 51.5, 'kPa', 0.91, '{"transducer_reading": 51.6, "temperature_comp": -0.1}', NOW() - INTERVAL '2 minutes'),
('650e8400-e29b-41d4-a716-446655440002', 'pore_pressure', 50.8, 'kPa', 0.93, '{"transducer_reading": 50.9, "temperature_comp": -0.1}', NOW() - INTERVAL '3 minutes'),
-- Environmental data
('650e8400-e29b-41d4-a716-446655440004', 'temperature', 28.5, '°C', 0.98, '{"humidity": 45.2, "pressure": 1013.2}', NOW() - INTERVAL '30 seconds'),
('650e8400-e29b-41d4-a716-446655440004', 'temperature', 28.7, '°C', 0.97, '{"humidity": 44.8, "pressure": 1013.1}', NOW() - INTERVAL '1 minute'),
('650e8400-e29b-41d4-a716-446655440004', 'humidity', 45.2, '%', 0.96, '{"temperature": 28.5, "pressure": 1013.2}', NOW() - INTERVAL '30 seconds'),
-- Thermal imaging data
('650e8400-e29b-41d4-a716-446655440005', 'temperature', 35.2, '°C', 0.88, '{"max_temp": 35.2, "min_temp": 22.1, "avg_temp": 28.6, "hotspot_coords": {"x": 320, "y": 240}}', NOW() - INTERVAL '4 hours'),
('650e8400-e29b-41d4-a716-446655440005', 'temperature', 32.8, '°C', 0.90, '{"max_temp": 32.8, "min_temp": 21.8, "avg_temp": 27.3, "hotspot_coords": {"x": 315, "y": 235}}', NOW() - INTERVAL '8 hours'),
-- Displacement data
('650e8400-e29b-41d4-a716-446655440003', 'displacement', 0.25, 'mm', 0.85, '{"x_axis": 0.12, "y_axis": 0.08, "z_axis": 0.21}', NOW() - INTERVAL '2 hours');

-- Insert risk assessments
INSERT INTO risk_assessments (id, mine_site_id, assessment_type, risk_level, probability, confidence, prediction_data, affected_zones, valid_from, valid_until) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'slope_stability', 'critical', 0.89, 0.92, 
 '{"model": "M5Rules_GA", "factors": {"strain": 3.2, "pore_pressure": 52.0, "rainfall": 12.5, "temperature": 35.2}, "prediction_horizon": "24h"}',
 '{"zones": [{"name": "North Face Alpha", "coordinates": {"lat": 40.7135, "lng": -74.0055}, "impact_radius": 150}]}',
 NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '24 hours'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'thermal_anomaly', 'high', 0.72, 0.88,
 '{"model": "thermal_detection", "factors": {"max_temp": 35.2, "temp_gradient": 8.5, "duration": "4h"}, "micro_crack_probability": 0.76}',
 '{"zones": [{"name": "North Face Alpha", "coordinates": {"lat": 40.7135, "lng": -74.0055}, "impact_radius": 75}]}',
 NOW() - INTERVAL '10 minutes', NOW() + INTERVAL '48 hours'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'weather_impact', 'moderate', 0.45, 0.78,
 '{"model": "weather_correlation", "factors": {"rainfall_forecast": 25.0, "duration": "72h", "soil_saturation": 0.65}, "predicted_pore_pressure_increase": 15.2}',
 '{"zones": [{"name": "South Slope Beta", "coordinates": {"lat": 40.7120, "lng": -74.0065}, "impact_radius": 200}]}',
 NOW() - INTERVAL '1 hour', NOW() + INTERVAL '72 hours');

-- Insert alerts
INSERT INTO alerts (id, mine_site_id, risk_assessment_id, alert_type, severity, title, description, affected_areas, action_required, status, acknowledged_by, acknowledged_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 
 'emergency', 'critical', 'Imminent Rockfall Risk Detected', 
 'AI model detected critical instability patterns. Immediate evacuation recommended.',
 '{"zones": ["North Face Alpha"], "personnel_count": 12, "equipment_at_risk": ["Excavator-07", "Drill-03"]}',
 'EVACUATE ZONE IMMEDIATELY - Deploy emergency response team', 'active', NULL, NULL),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002',
 'prediction', 'critical', 'Thermal Anomaly - Micro-crack Detection',
 'Thermal imaging detected temperature increase indicating potential micro-fractures.',
 '{"zones": ["North Face Alpha"], "personnel_count": 8}',
 'Increase monitoring frequency, restrict access to affected area', 'acknowledged', '550e8400-e29b-41d4-a716-446655440011', NOW() - INTERVAL '10 minutes'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003',
 'prediction', 'moderate', 'Slope Stability Forecast Alert',
 'M5Rules + GA algorithm predicts increased risk based on weather patterns.',
 '{"zones": ["South Slope Beta"], "personnel_count": 5}',
 'Review weather forecast, prepare contingency plans', 'active', NULL, NULL),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', NULL,
 'system', 'moderate', 'Sensor Communication Lost',
 'Strain gauge STR-005 not responding. Last reading 4 hours ago.',
 '{"sensors": ["650e8400-e29b-41d4-a716-446655440003"], "affected_monitoring": "displacement"}',
 'Sensor maintenance completed - Communications restored', 'resolved', '550e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '30 minutes');

-- Insert notification logs
INSERT INTO notification_logs (alert_id, notification_type, recipient_id, recipient_contact, content, status, sent_at, delivered_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'sms', '550e8400-e29b-41d4-a716-446655440010', '+1-555-0101', 'EMERGENCY: Imminent rockfall risk detected at North Face Alpha. Evacuate immediately!', 'delivered', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '45 seconds'),
('850e8400-e29b-41d4-a716-446655440001', 'email', '550e8400-e29b-41d4-a716-446655440010', 'admin@copperridge.com', 'Critical Alert: Imminent Rockfall Risk...', 'delivered', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '50 seconds'),
('850e8400-e29b-41d4-a716-446655440001', 'sms', '550e8400-e29b-41d4-a716-446655440011', '+1-555-0102', 'EMERGENCY: Imminent rockfall risk detected at North Face Alpha. Evacuate immediately!', 'delivered', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '40 seconds'),
('850e8400-e29b-41d4-a716-446655440002', 'email', '550e8400-e29b-41d4-a716-446655440011', 'supervisor@copperridge.com', 'Thermal Anomaly Alert: Micro-crack detection...', 'delivered', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '14 minutes'),
('850e8400-e29b-41d4-a716-446655440003', 'dashboard', '550e8400-e29b-41d4-a716-446655440012', 'engineer@copperridge.com', 'Weather Impact Assessment: Heavy rainfall predicted...', 'delivered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- Enable realtime for all tables
ALTER TABLE alerts REPLICA IDENTITY FULL;
ALTER TABLE sensor_data REPLICA IDENTITY FULL;
ALTER TABLE risk_assessments REPLICA IDENTITY FULL;
ALTER TABLE sensor_stations REPLICA IDENTITY FULL;
ALTER TABLE notification_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE alerts;
ALTER publication supabase_realtime ADD TABLE sensor_data;
ALTER publication supabase_realtime ADD TABLE risk_assessments;
ALTER publication supabase_realtime ADD TABLE sensor_stations;
ALTER publication supabase_realtime ADD TABLE notification_logs;
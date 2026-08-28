-- Enable RLS policies for missing functionality and insert sample data

-- Allow alert creation and deliveries for demo
DROP POLICY IF EXISTS "Allow alert creation for demo" ON public.alerts;
CREATE POLICY "Allow alert creation for demo" 
ON public.alerts 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow alert delivery creation for demo" ON public.alert_deliveries;
CREATE POLICY "Allow alert delivery creation for demo" 
ON public.alert_deliveries 
FOR INSERT 
WITH CHECK (true);

-- Insert sample mine site data if it doesn't exist
INSERT INTO public.mine_sites (id, name, location, description, status) 
VALUES (
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Copper Ridge Mine',
  '{"latitude": 28.6139, "longitude": 77.2090, "address": "Delhi, India"}',
  'Large-scale copper mining operation in Northern India',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample sensor stations
INSERT INTO public.sensor_stations (id, mine_site_id, station_name, sensor_type, location, status, configuration) VALUES 
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Alpha-7', 'strain_gauge', '{"x": 100, "y": 200, "z": 150}', 'active', '{"sensitivity": "high", "threshold": 2.5}'),
('b2c3d4e5-f6g7-8901-2345-678901bcdefg', 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Beta-12', 'pore_pressure', '{"x": 300, "y": 400, "z": 180}', 'active', '{"range": "0-100kPa", "calibrated": true}'),
('c3d4e5f6-g7h8-9012-3456-789012cdefgh', 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Gamma-3', 'displacement', '{"x": 500, "y": 150, "z": 120}', 'active', '{"precision": "0.1mm", "type": "laser"}'),
('d4e5f6g7-h8i9-0123-4567-890123defghi', 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Delta-5', 'temperature', '{"x": 200, "y": 300, "z": 200}', 'maintenance', '{"range": "-40 to 80°C", "wireless": true}')
ON CONFLICT (id) DO NOTHING;

-- Insert some recent sensor data
INSERT INTO public.sensor_data (sensor_station_id, data_type, value, unit, raw_data, quality_score, timestamp) VALUES 
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'strain', 2.3, 'MPa', '{"raw_reading": 2.34567, "calibrated": true}', 0.95, NOW() - INTERVAL '5 minutes'),
('b2c3d4e5-f6g7-8901-2345-678901bcdefg', 'pressure', 45, 'kPa', '{"raw_reading": 44.8, "temperature_compensated": true}', 0.92, NOW() - INTERVAL '3 minutes'),
('c3d4e5f6-g7h8-9012-3456-789012cdefgh', 'displacement', 0.2, 'mm', '{"x": 0.1, "y": 0.15, "z": 0.05}', 0.98, NOW() - INTERVAL '2 minutes'),
('d4e5f6g7-h8i9-0123-4567-890123defghi', 'temperature', 35.2, '°C', '{"ambient": 34.8, "sensor_temp": 35.2}', 0.88, NOW() - INTERVAL '1 minute');
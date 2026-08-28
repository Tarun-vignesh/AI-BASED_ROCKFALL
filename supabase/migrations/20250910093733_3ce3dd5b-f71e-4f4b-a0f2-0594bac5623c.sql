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

-- Insert sample sensor stations with proper UUIDs
INSERT INTO public.sensor_stations (id, mine_site_id, station_name, sensor_type, location, status, configuration) VALUES 
(gen_random_uuid(), 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Alpha-7', 'strain_gauge', '{"x": 100, "y": 200, "z": 150}', 'active', '{"sensitivity": "high", "threshold": 2.5}'),
(gen_random_uuid(), 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Beta-12', 'pore_pressure', '{"x": 300, "y": 400, "z": 180}', 'active', '{"range": "0-100kPa", "calibrated": true}'),
(gen_random_uuid(), 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Gamma-3', 'displacement', '{"x": 500, "y": 150, "z": 120}', 'active', '{"precision": "0.1mm", "type": "laser"}'),
(gen_random_uuid(), 'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'Station Delta-5', 'temperature', '{"x": 200, "y": 300, "z": 200}', 'maintenance', '{"range": "-40 to 80°C", "wireless": true}');
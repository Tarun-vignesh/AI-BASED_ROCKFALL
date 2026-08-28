-- Enable core functionality for all buttons and options

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
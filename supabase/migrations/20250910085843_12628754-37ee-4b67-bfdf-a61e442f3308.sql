-- Make RLS policies more permissive for demo purposes
-- Allow viewing real-time streams without strict auth for demo
DROP POLICY IF EXISTS "Users can view streams from their mine sites" ON real_time_streams;
CREATE POLICY "Demo access to real_time_streams" 
ON real_time_streams 
FOR SELECT 
USING (true);

-- Allow viewing predictions without strict auth for demo  
DROP POLICY IF EXISTS "Users can view predictions for their mine sites" ON predictions;
CREATE POLICY "Demo access to predictions" 
ON predictions 
FOR SELECT 
USING (true);

-- Allow viewing AI models without strict auth for demo
DROP POLICY IF EXISTS "Users can view AI models" ON ai_models;
CREATE POLICY "Demo access to ai_models" 
ON ai_models 
FOR SELECT 
USING (true);

-- Insert some sample AI models for the framework
INSERT INTO ai_models (model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active) VALUES
('M5Rules + Genetic Algorithm', 'M5Rules+GA', 'v2024.09.10', 0.947, 15000, true, true),
('Thermal Anomaly Detection', 'thermal_analysis', 'v2024.09.09', 0.893, 8500, true, true),  
('Video Analytics CNN/YOLO', 'video_analytics', 'v2024.09.08', 0.961, 12000, false, true),
('Hybrid Multi-Model Ensemble', 'hybrid', 'v2024.09.10', 0.978, 25000, true, false);

-- Create some sample predictions for the demo
INSERT INTO predictions (mine_site_id, prediction_type, risk_probability, confidence_level, timeframe_hours, indian_factors, raw_data_sources, valid_until) VALUES
('f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'historical_analysis', 0.75, 0.92, 72, 
'{"monsoonSeason": true, "tropicalClimate": true, "geologicalType": "laterite_ironore"}',
'{"datasets": ["sensor_historical", "weather_records"], "processingMethod": "M5Rules+GA", "indianOptimization": true}',
now() + interval '72 hours'),

('f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'thermal_analysis', 0.68, 0.89, 24,
'{"thermalExpansion": "moderate", "ambientTemp": 42.5, "hotSpots": 3}',
'{"thermalData": "thermal_archive", "modelUsed": "thermal_analysis"}',
now() + interval '24 hours'),

('f7a3b2c1-4d5e-6f78-9012-3456789abcde', 'real_time', 0.82, 0.95, 6,
'{"currentRainfall": 23.4, "porePress ure": 45, "strain": 2.3}',
'{"sensorData": "live_streams", "modelUsed": "hybrid"}',
now() + interval '6 hours');
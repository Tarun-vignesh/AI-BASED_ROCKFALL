-- Fix RLS policies for demo access (no auth required)
DROP POLICY IF EXISTS "Users can view streams from their mine sites" ON real_time_streams;
CREATE POLICY "Demo access to real_time_streams" 
ON real_time_streams 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can view predictions for their mine sites" ON predictions;
CREATE POLICY "Demo access to predictions" 
ON predictions 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can view AI models" ON ai_models;
CREATE POLICY "Demo access to ai_models" 
ON ai_models 
FOR SELECT 
USING (true);

-- Insert sample AI models for the ML framework
INSERT INTO ai_models (model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active) VALUES
('M5Rules + Genetic Algorithm', 'M5Rules+GA', 'v2024.09.10', 0.947, 15000, true, true),
('Thermal Anomaly Detection', 'thermal_analysis', 'v2024.09.09', 0.893, 8500, true, true),  
('Video Analytics CNN/YOLO', 'video_analytics', 'v2024.09.08', 0.961, 12000, false, true),
('Hybrid Multi-Model Ensemble', 'hybrid', 'v2024.09.10', 0.978, 25000, true, false)
ON CONFLICT (model_name, model_type) DO NOTHING;
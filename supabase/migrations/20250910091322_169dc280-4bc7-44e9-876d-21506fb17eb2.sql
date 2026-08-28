-- Update the model_type constraint to include our new model types
ALTER TABLE ai_models DROP CONSTRAINT IF EXISTS ai_models_model_type_check;
ALTER TABLE ai_models ADD CONSTRAINT ai_models_model_type_check 
CHECK (model_type = ANY (ARRAY['rockfall'::text, 'slope_stability'::text, 'weather_impact'::text, 'thermal_analysis'::text, 'video_analysis'::text, 'M5Rules+GA'::text, 'video_analytics'::text, 'hybrid'::text]));

-- Fix RLS policies for demo access
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

-- Insert sample AI models for the ML framework  
INSERT INTO ai_models (model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active) VALUES
('M5Rules + Genetic Algorithm', 'M5Rules+GA', 'v2024.09.10', 0.947, 15000, true, true),
('Thermal Anomaly Detection', 'thermal_analysis', 'v2024.09.09', 0.893, 8500, true, true),  
('Video Analytics CNN/YOLO', 'video_analytics', 'v2024.09.08', 0.961, 12000, false, true),
('Hybrid Multi-Model Ensemble', 'hybrid', 'v2024.09.10', 0.978, 25000, true, false);
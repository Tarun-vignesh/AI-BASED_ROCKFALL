-- Add real-time data streaming tables for AI rockfall prediction

-- Create table for real-time sensor streams
CREATE TABLE public.real_time_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('sensor', 'drone', 'weather', 'thermal', 'video', 'seismic')),
  stream_source TEXT NOT NULL,
  data_payload JSONB NOT NULL,
  processed_by_ai BOOLEAN DEFAULT FALSE,
  risk_score NUMERIC,
  confidence_score NUMERIC,
  indian_conditions JSONB, -- Specific to Indian mining conditions (monsoon, geology, etc)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AI prediction models
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_type TEXT NOT NULL CHECK (model_type IN ('rockfall', 'slope_stability', 'weather_impact', 'thermal_analysis', 'video_analysis')),
  accuracy_score NUMERIC,
  training_data_size INTEGER,
  indian_specific BOOLEAN DEFAULT FALSE, -- Trained on Indian mining conditions
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for real-time predictions
CREATE TABLE public.predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL,
  model_id UUID REFERENCES public.ai_models(id),
  prediction_type TEXT NOT NULL,
  risk_probability NUMERIC NOT NULL,
  confidence_level NUMERIC NOT NULL,
  affected_coordinates JSONB,
  timeframe_hours INTEGER,
  indian_factors JSONB, -- Monsoon season, geological factors, etc
  raw_data_sources JSONB, -- References to input data
  alert_triggered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE
);

-- Create table for alert delivery tracking
CREATE TABLE public.alert_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.alerts(id),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('dashboard', 'email', 'sms')),
  recipient_id UUID,
  recipient_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Indian mining conditions tracking
CREATE TABLE public.indian_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL,
  monsoon_season BOOLEAN DEFAULT FALSE,
  rainfall_intensity TEXT,
  geological_type TEXT, -- laterite, granite, sandstone common in Indian mines
  temperature_celsius NUMERIC,
  humidity_percent NUMERIC,
  wind_speed_kmh NUMERIC,
  seismic_activity_level TEXT,
  groundwater_level NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.real_time_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indian_conditions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for real_time_streams
CREATE POLICY "Users can view streams from their mine sites" 
ON public.real_time_streams 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND (profiles.mine_site_id = real_time_streams.mine_site_id OR profiles.role = 'admin')
));

-- Create RLS policies for ai_models
CREATE POLICY "Users can view AI models" 
ON public.ai_models 
FOR SELECT 
USING (true); -- Models are generally viewable by authenticated users

-- Create RLS policies for predictions
CREATE POLICY "Users can view predictions for their mine sites" 
ON public.predictions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND (profiles.mine_site_id = predictions.mine_site_id OR profiles.role = 'admin')
));

-- Create RLS policies for alert_deliveries
CREATE POLICY "Users can view their alert deliveries" 
ON public.alert_deliveries 
FOR SELECT 
USING (recipient_id = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create RLS policies for indian_conditions
CREATE POLICY "Users can view conditions for their mine sites" 
ON public.indian_conditions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND (profiles.mine_site_id = indian_conditions.mine_site_id OR profiles.role = 'admin')
));

-- Create indexes for performance
CREATE INDEX idx_real_time_streams_mine_site_created ON public.real_time_streams(mine_site_id, created_at DESC);
CREATE INDEX idx_predictions_mine_site_created ON public.predictions(mine_site_id, created_at DESC);
CREATE INDEX idx_alert_deliveries_alert_id ON public.alert_deliveries(alert_id);
CREATE INDEX idx_indian_conditions_mine_site_recorded ON public.indian_conditions(mine_site_id, recorded_at DESC);

-- Insert sample AI models specific to Indian mining conditions
INSERT INTO public.ai_models (model_name, model_version, model_type, accuracy_score, training_data_size, indian_specific, active) VALUES
('RockfallPredictor_Indian_V2', '2.1', 'rockfall', 0.94, 50000, true, true),
('SlopeStability_Monsoon', '1.8', 'slope_stability', 0.89, 35000, true, true),
('WeatherImpact_Indian', '3.0', 'weather_impact', 0.92, 75000, true, true),
('ThermalAnalysis_Tropical', '1.5', 'thermal_analysis', 0.87, 25000, true, true),
('VideoAnalysis_OpenPit', '2.3', 'video_analysis', 0.91, 60000, true, true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.real_time_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.indian_conditions;

-- Set replica identity for realtime
ALTER TABLE public.real_time_streams REPLICA IDENTITY FULL;
ALTER TABLE public.predictions REPLICA IDENTITY FULL;
ALTER TABLE public.alert_deliveries REPLICA IDENTITY FULL;
ALTER TABLE public.indian_conditions REPLICA IDENTITY FULL;
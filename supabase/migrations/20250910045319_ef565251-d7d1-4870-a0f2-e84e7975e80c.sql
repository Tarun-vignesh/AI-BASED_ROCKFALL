-- Create mine sites table
CREATE TABLE public.mine_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location JSONB NOT NULL, -- {lat, lng, elevation}
  area_boundaries JSONB, -- GeoJSON polygon
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor stations table
CREATE TABLE public.sensor_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL REFERENCES public.mine_sites(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('strain', 'pore_pressure', 'displacement', 'environmental', 'thermal', 'video')),
  location JSONB NOT NULL, -- {lat, lng, elevation}
  configuration JSONB, -- sensor-specific settings
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sensor data table (partitioned by time for performance)
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_station_id UUID NOT NULL REFERENCES public.sensor_stations(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_type TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  raw_data JSONB,
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL REFERENCES public.mine_sites(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('long_term', 'short_term', 'immediate')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  probability NUMERIC CHECK (probability >= 0 AND probability <= 1),
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  affected_zones JSONB, -- Array of zone coordinates
  prediction_data JSONB, -- ML model outputs
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mine_site_id UUID NOT NULL REFERENCES public.mine_sites(id) ON DELETE CASCADE,
  risk_assessment_id UUID REFERENCES public.risk_assessments(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('prediction', 'anomaly', 'emergency')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_areas JSONB,
  action_required TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table for mine personnel
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'supervisor', 'engineer', 'operator', 'viewer')),
  mine_site_id UUID REFERENCES public.mine_sites(id) ON DELETE SET NULL,
  phone_number TEXT,
  notification_preferences JSONB DEFAULT '{"sms": true, "email": true, "dashboard": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification logs table
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'email', 'push', 'dashboard')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  recipient_contact TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mine_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Mine sites policies (users can only see sites they're assigned to)
CREATE POLICY "Users can view assigned mine sites" 
ON public.mine_sites FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.mine_site_id = mine_sites.id OR profiles.role = 'admin')
  )
);

-- Sensor stations policies
CREATE POLICY "Users can view sensor stations in their mine sites" 
ON public.sensor_stations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.mine_site_id = sensor_stations.mine_site_id OR profiles.role = 'admin')
  )
);

-- Sensor data policies  
CREATE POLICY "Users can view sensor data from their mine sites" 
ON public.sensor_data FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sensor_stations ss
    JOIN public.profiles p ON (p.mine_site_id = ss.mine_site_id OR p.role = 'admin')
    WHERE ss.id = sensor_data.sensor_station_id AND p.id = auth.uid()
  )
);

-- Risk assessments policies
CREATE POLICY "Users can view risk assessments for their mine sites" 
ON public.risk_assessments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.mine_site_id = risk_assessments.mine_site_id OR profiles.role = 'admin')
  )
);

-- Alerts policies
CREATE POLICY "Users can view alerts for their mine sites" 
ON public.alerts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.mine_site_id = alerts.mine_site_id OR profiles.role = 'admin')
  )
);

CREATE POLICY "Users can update alerts for their mine sites" 
ON public.alerts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND (profiles.mine_site_id = alerts.mine_site_id OR profiles.role IN ('admin', 'supervisor', 'engineer'))
  )
);

-- Notification logs policies
CREATE POLICY "Users can view their notification logs" 
ON public.notification_logs FOR SELECT USING (
  recipient_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_sensor_data_timestamp ON public.sensor_data(timestamp DESC);
CREATE INDEX idx_sensor_data_station_id ON public.sensor_data(sensor_station_id);
CREATE INDEX idx_alerts_mine_site_status ON public.alerts(mine_site_id, status);
CREATE INDEX idx_risk_assessments_valid ON public.risk_assessments(mine_site_id, valid_from, valid_until);
CREATE INDEX idx_sensor_stations_mine_type ON public.sensor_stations(mine_site_id, sensor_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_mine_sites_updated_at
  BEFORE UPDATE ON public.mine_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sensor_stations_updated_at
  BEFORE UPDATE ON public.sensor_stations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.mine_sites (name, location, description) VALUES
('Copper Ridge Mine', '{"lat": 40.7128, "lng": -74.0060, "elevation": 1200}', 'Large open-pit copper mining operation'),
('Iron Valley Mine', '{"lat": 34.0522, "lng": -118.2437, "elevation": 800}', 'Iron ore extraction facility');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
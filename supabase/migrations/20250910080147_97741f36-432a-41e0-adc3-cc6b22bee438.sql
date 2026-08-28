-- Create sample mine sites with proper UUIDs 
INSERT INTO public.mine_sites (id, name, location, description, status) VALUES 
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Copper Ridge Open Pit Mine',
  '{"coordinates": [77.5946, 12.9716], "address": "Karnataka Mining District, India", "elevation": 920}',
  'Large-scale copper extraction facility with AI-monitored rockfall prediction system',
  'active'
);

-- Create sample AI models for Indian mining conditions
INSERT INTO public.ai_models (model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active) VALUES
(
  'IndianRockfall-Predictor-v2.1',
  'rockfall',
  '2.1.0',
  0.947,
  125000,
  true,
  true
),
(
  'ThermalAnomaly-Detector-IN',
  'thermal_analysis',
  '1.5.1',
  0.891,
  67000,
  true,
  true
);

-- Create sample Indian conditions
INSERT INTO public.indian_conditions (mine_site_id, monsoon_season, rainfall_intensity, geological_type, temperature_celsius, humidity_percent, wind_speed_kmh, seismic_activity_level, groundwater_level) VALUES
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  false,
  'light',
  'granite_gneiss',
  32.5,
  68.2,
  12.3,
  'low',
  15.8
);

-- Create sample real-time streams
INSERT INTO public.real_time_streams (mine_site_id, stream_type, stream_source, data_payload, processed_by_ai, risk_score, confidence_score, indian_conditions) VALUES
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'sensor',
  'STR-001_live',
  '{"strain_mpa": 2.8, "temperature": 34.2, "vibration": 0.45, "timestamp": "2024-01-15T10:30:00Z"}',
  true,
  0.65,
  0.92,
  '{"monsoon_active": false, "geological_stability": "stable", "weather_impact": "minimal"}'
),
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'weather',
  'weather_station_01',
  '{"temperature": 32.5, "humidity": 68.2, "rainfall": 2.1, "wind_speed": 12.3, "pressure": 1013.2}',
  true,
  0.35,
  0.88,
  '{"monsoon_season": false, "rainfall_category": "light", "visibility": "good"}'
),
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'thermal',
  'thermal_cam_01',
  '{"avg_temp": 45.8, "max_temp": 58.2, "hot_spots": 3, "anomaly_detected": true}',
  true,
  0.78,
  0.85,
  '{"ambient_temp": 32.5, "thermal_stability": "concerning", "investigation_required": true}'
);

-- Create sample predictions
INSERT INTO public.predictions (mine_site_id, model_id, prediction_type, risk_probability, confidence_level, timeframe_hours, indian_factors, affected_coordinates, valid_until, alert_triggered) VALUES
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  (SELECT id FROM ai_models WHERE model_name = 'IndianRockfall-Predictor-v2.1' LIMIT 1),
  'rockfall_risk',
  0.72,
  0.94,
  12,
  '{"monsoon_impact": "minimal", "geological_stability": "moderate_concern", "thermal_expansion": "elevated"}',
  '{"zone": "North Face Alpha", "coordinates": [[77.5948, 12.9718], [77.5952, 12.9722]]}',
  NOW() + INTERVAL '12 hours',
  true
);

-- Create sample alerts with correct constraint values
INSERT INTO public.alerts (mine_site_id, title, description, severity, alert_type, status, action_required, affected_areas) VALUES
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'High Rockfall Risk Detected - North Face Alpha',
  'AI analysis indicates 72% probability of rockfall within 12 hours. Multiple strain sensors showing elevated readings. Immediate evacuation of personnel recommended.',
  'critical',
  'prediction',
  'active',
  'Evacuate personnel from North Face Alpha zone, implement safety barriers, increase monitoring frequency',
  '["North Face Alpha", "Adjacent access routes", "Equipment staging area"]'
),
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Thermal Anomaly - Equipment Overheating',
  'Thermal imaging detected unusual heat signature in East Wall monitoring equipment. Potential equipment malfunction or environmental factor.',
  'warning',
  'anomaly', 
  'acknowledged',
  'Inspect thermal monitoring equipment, check cooling systems, verify sensor calibration',
  '["East Wall Beta equipment shelter"]'
);

-- Create sample sensor stations
INSERT INTO public.sensor_stations (mine_site_id, station_name, sensor_type, location, status, configuration) VALUES
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'North Face Strain Monitor STR-001',
  'strain',
  '{"zone": "North Face Alpha", "coordinates": [77.5950, 12.9720], "depth": 45}',
  'active',
  '{"sampling_rate": 1000, "threshold_mpa": 3.0, "calibration_date": "2024-01-15"}'
);
-- Create sample mine sites with proper UUIDs (fixed)
INSERT INTO public.mine_sites (id, name, location, description, status) VALUES 
(
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Copper Ridge Open Pit Mine',
  '{"coordinates": [77.5946, 12.9716], "address": "Karnataka Mining District, India", "elevation": 920}',
  'Large-scale copper extraction facility with AI-monitored rockfall prediction system',
  'active'
),
(
  'a1b2c3d4-e5f6-7890-1234-56789abcdef0', 
  'Iron Ore Valley Mine',
  '{"coordinates": [85.8245, 20.9517], "address": "Odisha Mining Region, India", "elevation": 650}',
  'Iron ore mining operation with advanced sensor monitoring network',
  'active'
),
(
  '12345678-90ab-cdef-1234-567890abcdef',
  'Gold Hills Mining Complex', 
  '{"coordinates": [76.6394, 12.3375], "address": "Mysore District, Karnataka, India", "elevation": 760}',
  'Gold extraction facility with comprehensive safety monitoring',
  'active'
);

-- Create sample sensor stations
INSERT INTO public.sensor_stations (id, mine_site_id, station_name, sensor_type, location, status, configuration) VALUES
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'North Face Strain Monitor STR-001',
  'strain',
  '{"zone": "North Face Alpha", "coordinates": [77.5950, 12.9720], "depth": 45}',
  'active',
  '{"sampling_rate": 1000, "threshold_mpa": 3.0, "calibration_date": "2024-01-15"}'
),
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 
  'Pore Pressure Monitor PPM-012',
  'pore_pressure',
  '{"zone": "East Wall Beta", "coordinates": [77.5955, 12.9715], "depth": 32}',
  'active',
  '{"sampling_rate": 500, "threshold_kpa": 50, "calibration_date": "2024-01-10"}'
),
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Displacement Sensor DSP-003', 
  'displacement',
  '{"zone": "South Wall Gamma", "coordinates": [77.5945, 12.9710], "depth": 28}',
  'active',
  '{"sampling_rate": 100, "threshold_mm": 5.0, "calibration_date": "2024-01-12"}'
);

-- Create sample AI models for Indian mining conditions (fixed model types)
INSERT INTO public.ai_models (id, model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active) VALUES
(
  gen_random_uuid(),
  'IndianRockfall-Predictor-v2.1',
  'rockfall',
  '2.1.0',
  0.947,
  125000,
  true,
  true
),
(
  gen_random_uuid(),
  'MonsoonStability-Analyzer',
  'slope_stability',
  '1.8.2', 
  0.923,
  89000,
  true,
  true
),
(
  gen_random_uuid(),
  'ThermalAnomaly-Detector-IN',
  'thermal_analysis',
  '1.5.1',
  0.891,
  67000,
  true,
  true
);

-- Create sample Indian mining conditions
INSERT INTO public.indian_conditions (id, mine_site_id, monsoon_season, rainfall_intensity, geological_type, temperature_celsius, humidity_percent, wind_speed_kmh, seismic_activity_level, groundwater_level) VALUES
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  false,
  'light',
  'granite_gneiss',
  32.5,
  68.2,
  12.3,
  'low',
  15.8
),
(
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-1234-56789abcdef0',
  true,
  'heavy', 
  'laterite',
  29.8,
  85.4,
  18.7,
  'moderate',
  8.2
),
(
  gen_random_uuid(),
  '12345678-90ab-cdef-1234-567890abcdef',
  false,
  'moderate',
  'sandstone',
  35.1,
  58.9,
  8.9,
  'low',
  22.1
);

-- Create sample real-time streams (simulating live data)
INSERT INTO public.real_time_streams (id, mine_site_id, stream_type, stream_source, data_payload, processed_by_ai, risk_score, confidence_score, indian_conditions) VALUES
(
  gen_random_uuid(),
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
  gen_random_uuid(),
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
  gen_random_uuid(), 
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
INSERT INTO public.predictions (id, mine_site_id, model_id, prediction_type, risk_probability, confidence_level, timeframe_hours, indian_factors, affected_coordinates, valid_until, alert_triggered) VALUES
(
  gen_random_uuid(),
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
),
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde', 
  (SELECT id FROM ai_models WHERE model_name = 'ThermalAnomaly-Detector-IN' LIMIT 1),
  'thermal_stability',
  0.45,
  0.87,
  6,
  '{"temperature_gradient": "normal", "humidity_effect": "low", "material_expansion": "within_limits"}',
  '{"zone": "East Wall Beta", "coordinates": [[77.5953, 12.9713], [77.5957, 12.9717]]}',
  NOW() + INTERVAL '6 hours',
  false
);

-- Create sample alerts
INSERT INTO public.alerts (id, mine_site_id, title, description, severity, alert_type, status, action_required, affected_areas, risk_assessment_id) VALUES
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'High Rockfall Risk Detected - North Face Alpha',
  'AI analysis indicates 72% probability of rockfall within 12 hours. Multiple strain sensors showing elevated readings. Immediate evacuation of personnel recommended.',
  'high',
  'rockfall_prediction',
  'active',
  'Evacuate personnel from North Face Alpha zone, implement safety barriers, increase monitoring frequency',
  '["North Face Alpha", "Adjacent access routes", "Equipment staging area"]',
  (SELECT id FROM predictions WHERE prediction_type = 'rockfall_risk' LIMIT 1)
),
(
  gen_random_uuid(),
  'f7a3b2c1-4d5e-6f78-9012-3456789abcde',
  'Thermal Anomaly - Equipment Overheating',
  'Thermal imaging detected unusual heat signature in East Wall monitoring equipment. Potential equipment malfunction or environmental factor.',
  'moderate',
  'thermal_anomaly', 
  'investigating',
  'Inspect thermal monitoring equipment, check cooling systems, verify sensor calibration',
  '["East Wall Beta equipment shelter"]',
  null
);
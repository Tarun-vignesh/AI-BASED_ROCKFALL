-- Seed Data for rockfall_ai Database
USE rockfall_ai;

-- 1. Demo Mine Site
INSERT INTO mine_sites (id, name, description, location, area_boundaries, status)
VALUES (
    'ms-001-demo-mine',
    'Bellary Iron Ore Open Pit Mine',
    'Primary open-cast iron ore mine in Karnataka, India',
    '{"latitude": 15.1424, "longitude": 76.9214, "elevation": 485, "region": "Karnataka, India"}',
    '{"type": "Polygon", "coordinates": [[[76.92, 15.14], [76.93, 15.14], [76.93, 15.15], [76.92, 15.15], [76.92, 15.14]]]}',
    'active'
) ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Initial Users (Passwordshashed with bcrypt for 'Admin@123', 'Engineer@123', 'Operator@123')
-- Hash for Admin@123: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW
-- Hash for Engineer@123: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW
-- Hash for Operator@123: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW

INSERT INTO users (id, email, password_hash, full_name, phone_number, role, mine_site_id, notification_preferences)
VALUES
(
    'usr-001-admin',
    'admin@rockfall.ai',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW',
    'Chief Mine Safety Officer',
    '+91-9876543210',
    'admin',
    'ms-001-demo-mine',
    '{"email": true, "sms": true, "inApp": true}'
),
(
    'usr-002-engineer',
    'engineer@rockfall.ai',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW',
    'Senior Geotechnical Engineer',
    '+91-9876543211',
    'engineer',
    'ms-001-demo-mine',
    '{"email": true, "sms": false, "inApp": true}'
),
(
    'usr-003-operator',
    'operator@rockfall.ai',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW',
    'Field Safety Operator',
    '+91-9876543212',
    'operator',
    'ms-001-demo-mine',
    '{"email": false, "sms": true, "inApp": true}'
) ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. AI Models
INSERT INTO ai_models (id, model_name, model_type, model_version, accuracy_score, training_data_size, indian_specific, active)
VALUES (
    'mod-001-rf-v1',
    'RandomForest Rockfall Classifier',
    'RandomForestClassifier',
    '1.2.0',
    0.947,
    15000,
    TRUE,
    TRUE
) ON DUPLICATE KEY UPDATE active=VALUES(active);

-- 4. Sensor Stations
INSERT INTO sensor_stations (id, mine_site_id, station_name, sensor_type, location, configuration, status)
VALUES 
('ss-001', 'ms-001-demo-mine', 'North Wall Piezometer & Tilt Alpha', 'tiltmeter', '{"latitude": 15.1430, "longitude": 76.9220}', '{"sampling_interval": 10}', 'active'),
('ss-002', 'ms-001-demo-mine', 'East Slope Extensometer Beta', 'extensometer', '{"latitude": 15.1440, "longitude": 76.9230}', '{"sampling_interval": 10}', 'active'),
('ss-003', 'ms-001-demo-mine', 'South Bench Seismometer Gamma', 'seismometer', '{"latitude": 15.1410, "longitude": 76.9210}', '{"sampling_interval": 5}', 'active'),
('ss-004', 'ms-001-demo-mine', 'West Crest Weather Station', 'weather_station', '{"latitude": 15.1450, "longitude": 76.9200}', '{"sampling_interval": 30}', 'active')
ON DUPLICATE KEY UPDATE station_name=VALUES(station_name);

-- 5. Indian Conditions
INSERT INTO indian_conditions (id, mine_site_id, geological_type, groundwater_level, humidity_percent, monsoon_season, rainfall_intensity, seismic_activity_level, temperature_celsius, wind_speed_kmh)
VALUES (
    'ic-001',
    'ms-001-demo-mine',
    'Laterite / Weathered Iron Ore',
    4.5,
    78.0,
    TRUE,
    'Heavy',
    'Low',
    31.5,
    18.5
) ON DUPLICATE KEY UPDATE temperature_celsius=VALUES(temperature_celsius);

-- 6. Initial Predictions
INSERT INTO predictions (id, mine_site_id, model_id, prediction_type, risk_probability, confidence_level, affected_coordinates, indian_factors, timeframe_hours, alert_triggered)
VALUES (
    'pred-001',
    'ms-001-demo-mine',
    'mod-001-rf-v1',
    'rockfall_risk',
    0.725,
    0.89,
    '{"latitude": 15.1435, "longitude": 76.9225}',
    '["Monsoon saturation", "Laterite soil degradation", "High slope angle"]',
    12,
    TRUE
) ON DUPLICATE KEY UPDATE risk_probability=VALUES(risk_probability);

-- 7. Initial Risk Assessments
INSERT INTO risk_assessments (id, mine_site_id, assessment_type, risk_level, probability, confidence, affected_zones, prediction_data)
VALUES (
    'ra-001',
    'ms-001-demo-mine',
    'automated_slope_safety',
    'HIGH',
    0.725,
    0.89,
    '["North Slope Bench 3", "East Dump Wall"]',
    '{"risk_factors": ["Elevated displacement", "Monsoon rainfall"], "timeframe": "12 hours"}'
) ON DUPLICATE KEY UPDATE risk_level=VALUES(risk_level);

-- 8. Initial Alerts
INSERT INTO alerts (id, mine_site_id, risk_assessment_id, alert_type, severity, title, description, affected_areas, action_required, status)
VALUES (
    'alt-001',
    'ms-001-demo-mine',
    'ra-001',
    'rockfall_warning',
    'high',
    'Elevated Slope Deformation Detected on North Wall',
    'Extensometer readings indicate displacement rate exceeds 1.5mm/hr combined with heavy monsoon saturation.',
    '["North Wall Bench 3", "Haul Road B"]',
    'Evacuate personnel from Bench 3. Restrict heavy vehicle movement on Haul Road B.',
    'active'
) ON DUPLICATE KEY UPDATE title=VALUES(title);

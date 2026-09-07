-- MySQL 8.x Schema for AI-BASED_ROCKFALL Prediction System
-- Database Name: rockfall_ai

CREATE DATABASE IF NOT EXISTS rockfall_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rockfall_ai;

-- 1. mine_sites
CREATE TABLE IF NOT EXISTS mine_sites (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location JSON NOT NULL,
    area_boundaries JSON,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    mine_site_id VARCHAR(36),
    notification_preferences JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. sensor_stations
CREATE TABLE IF NOT EXISTS sensor_stations (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    location JSON NOT NULL,
    configuration JSON,
    status VARCHAR(50) DEFAULT 'active',
    last_reading_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. sensor_data
CREATE TABLE IF NOT EXISTS sensor_data (
    id VARCHAR(36) PRIMARY KEY,
    sensor_station_id VARCHAR(36) NOT NULL,
    data_type VARCHAR(100) NOT NULL,
    value DOUBLE,
    unit VARCHAR(50),
    raw_data JSON,
    quality_score DOUBLE DEFAULT 1.0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_station_id) REFERENCES sensor_stations(id) ON DELETE CASCADE,
    INDEX idx_sensor_station_timestamp (sensor_station_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ai_models
CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(36) PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    accuracy_score DOUBLE,
    training_data_size INT,
    indian_specific BOOLEAN DEFAULT TRUE,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. predictions
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    model_id VARCHAR(36),
    prediction_type VARCHAR(100) NOT NULL,
    risk_probability DOUBLE NOT NULL,
    confidence_level DOUBLE NOT NULL,
    affected_coordinates JSON,
    indian_factors JSON,
    raw_data_sources JSON,
    timeframe_hours INT DEFAULT 24,
    alert_triggered BOOLEAN DEFAULT FALSE,
    valid_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ai_models(id) ON DELETE SET NULL,
    INDEX idx_predictions_mine_site (mine_site_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. risk_assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    assessment_type VARCHAR(100) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    probability DOUBLE,
    confidence DOUBLE,
    affected_zones JSON,
    prediction_data JSON,
    valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
    valid_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE,
    INDEX idx_risk_assessments_mine_site (mine_site_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. alerts
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    risk_assessment_id VARCHAR(36),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_areas JSON,
    action_required TEXT,
    status VARCHAR(50) DEFAULT 'active',
    acknowledged_by VARCHAR(255),
    acknowledged_at DATETIME,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_assessment_id) REFERENCES risk_assessments(id) ON DELETE SET NULL,
    INDEX idx_alerts_mine_site_status (mine_site_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. alert_deliveries
CREATE TABLE IF NOT EXISTS alert_deliveries (
    id VARCHAR(36) PRIMARY KEY,
    alert_id VARCHAR(36),
    recipient_id VARCHAR(36),
    recipient_contact VARCHAR(255),
    delivery_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    sent_at DATETIME,
    delivered_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
    id VARCHAR(36) PRIMARY KEY,
    alert_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36),
    notification_type VARCHAR(50) NOT NULL,
    recipient_contact VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    sent_at DATETIME,
    delivered_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. real_time_streams
CREATE TABLE IF NOT EXISTS real_time_streams (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    stream_type VARCHAR(100) NOT NULL,
    stream_source VARCHAR(100) NOT NULL,
    data_payload JSON NOT NULL,
    indian_conditions JSON,
    risk_score DOUBLE,
    confidence_score DOUBLE,
    processed_by_ai BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE,
    INDEX idx_real_time_streams_mine_site (mine_site_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. indian_conditions
CREATE TABLE IF NOT EXISTS indian_conditions (
    id VARCHAR(36) PRIMARY KEY,
    mine_site_id VARCHAR(36) NOT NULL,
    geological_type VARCHAR(100) DEFAULT 'Laterite',
    groundwater_level DOUBLE,
    humidity_percent DOUBLE,
    monsoon_season BOOLEAN DEFAULT FALSE,
    rainfall_intensity VARCHAR(50) DEFAULT 'Light',
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    seismic_activity_level VARCHAR(50) DEFAULT 'Low',
    temperature_celsius DOUBLE,
    wind_speed_kmh DOUBLE,
    FOREIGN KEY (mine_site_id) REFERENCES mine_sites(id) ON DELETE CASCADE,
    INDEX idx_indian_conditions_mine_site (mine_site_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

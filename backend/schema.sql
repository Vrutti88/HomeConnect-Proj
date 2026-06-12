-- HomeConnect Smart Home Automation Platform
-- MySQL Database Schema

CREATE DATABASE IF NOT EXISTS homeconnect;
USE homeconnect;

-- Users table
CREATE TABLE users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Devices table
CREATE TABLE devices (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    name         VARCHAR(100) NOT NULL,
    type         ENUM('light','thermostat','camera','lock','sensor') NOT NULL,
    location     VARCHAR(100),
    status       ENUM('online','offline') DEFAULT 'offline',
    state        JSON,          
    is_active    BOOLEAN DEFAULT TRUE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Automation rules table
CREATE TABLE automation_rules (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    name             VARCHAR(150) NOT NULL,
    trigger_type     ENUM('time','threshold','device_state') NOT NULL,
    trigger_value    VARCHAR(255),           -- "07:00" | "temperature>28"
    action_device_id INT,
    action_command   TEXT,                  -- JSON: {"power":"on","brightness":100}
    is_enabled       BOOLEAN DEFAULT TRUE,
    last_triggered   DATETIME,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (action_device_id) REFERENCES devices(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id)
);

-- Telemetry logs (time-series)
CREATE TABLE telemetry_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    device_id   INT NOT NULL,
    metric      VARCHAR(50) NOT NULL,        -- temperature, motion, power_usage
    value       FLOAT NOT NULL,
    unit        VARCHAR(20),                 -- °C, W, %
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_metric (device_id, metric),
    INDEX idx_recorded_at (recorded_at)
);

-- Alerts table
CREATE TABLE alerts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    device_id   INT NOT NULL,
    user_id     INT NOT NULL,
    type        ENUM('security','offline','automation','threshold') NOT NULL,
    severity    ENUM('info','warning','critical') NOT NULL,
    message     VARCHAR(255) NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at)
);

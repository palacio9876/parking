-- Multi-Company Parking System Database Schema
-- Database Management System: MariaDB

-- Drop database if it exists and recreate it
DROP DATABASE IF EXISTS parking_system;
CREATE DATABASE parking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parking_system;

-- Companies Table
CREATE TABLE companies (
    id_company INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20) NOT NULL UNIQUE, -- Modified: nit to tax_id
    address VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    logo_url LONGBLOB,
    active BOOLEAN DEFAULT TRUE,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiration_date DATETIME,
    plan ENUM('basic', 'premium', 'enterprise') NOT NULL, -- Modified: plan values to english
    CONSTRAINT chk_plan CHECK (plan IN ('basic', 'premium', 'enterprise'))
) ENGINE=InnoDB;

-- System Users Table
CREATE TABLE users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL, -- Modified: usuario_login to username
    password VARCHAR(255) NOT NULL, -- Modified: contraseña to password
    role ENUM('admin', 'operator') NOT NULL, -- Modified: rol to role and values to english
    active BOOLEAN DEFAULT TRUE,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_access DATETIME,
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    CONSTRAINT chk_role CHECK (role IN ('admin', 'operator')),
    CONSTRAINT uq_username_company UNIQUE (username, id_company)
) ENGINE=InnoDB;

-- Table to log login attempts
CREATE TABLE login_attempts (
    id_attempt INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    successful BOOLEAN NOT NULL, -- Modified: exitoso to successful
    ip_address VARCHAR(45) NOT NULL,
    attempt_date DATETIME NOT NULL, -- Modified: fecha_intento to attempt_date
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    INDEX idx_username (username),
    INDEX idx_ip_address (ip_address),
    INDEX idx_attempt_date (attempt_date)
) ENGINE=InnoDB;

-- Company Settings Table
CREATE TABLE company_settings (
    id_setting INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    car_total_capacity INT NOT NULL DEFAULT 50, -- Modified: capacidad_total_carros to car_total_capacity
    motorcycle_total_capacity INT NOT NULL DEFAULT 30, -- Modified: capacidad_total_motos to motorcycle_total_capacity
    bicycle_total_capacity INT NOT NULL DEFAULT 20, -- Modified: capacidad_total_bicicletas to bicycle_total_capacity
    opening_time TIME DEFAULT '06:00:00', -- Modified: horario_apertura to opening_time
    closing_time TIME DEFAULT '22:00:00', -- Modified: horario_cierre to closing_time
    vat_percentage DECIMAL(5,2) DEFAULT 19.00, -- Modified: iva_porcentaje to vat_percentage
    currency VARCHAR(10) DEFAULT 'COP', -- Modified: moneda to currency
    timezone VARCHAR(50) DEFAULT 'America/Bogota', -- Modified: zona_horaria to timezone
    operation_24h BOOLEAN DEFAULT FALSE, -- Modified: operacion_24h to operation_24h
    FOREIGN KEY (id_company) REFERENCES companies(id_company)
) ENGINE=InnoDB;

-- Vehicles Table
CREATE TABLE vehicles (
    id_vehicle INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    license_plate VARCHAR(10) NOT NULL, -- Modified: placa to license_plate
    type ENUM('car', 'motorcycle', 'bicycle') NOT NULL, -- Modified: tipo to type and values to english
    color VARCHAR(30) NOT NULL,
    model VARCHAR(50),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    CONSTRAINT chk_vehicle_type CHECK (type IN ('car', 'motorcycle', 'bicycle')),
    CONSTRAINT uq_plate_company UNIQUE (license_plate, id_company)
) ENGINE=InnoDB;

-- Rates Table
CREATE TABLE rates (
    id_rate INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    vehicle_type ENUM('car', 'motorcycle', 'bicycle') NOT NULL, -- Modified: tipo_vehiculo to vehicle_type
    hourly_rate DECIMAL(10,2) NOT NULL, -- Modified: valor_hora to hourly_rate
    minute_rate DECIMAL(10,2) NOT NULL, -- Modified: valor_minuto to minute_rate
    full_day_rate DECIMAL(10,2) NOT NULL, -- Modified: valor_dia_completo to full_day_rate
    effective_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Modified: fecha_vigencia_desde to effective_from
    effective_until DATETIME, -- Modified: fecha_vigencia_hasta to effective_until
    active BOOLEAN DEFAULT TRUE,
    -- Billing configuration
    billing_mode ENUM('minute','hour','day','mixed') NOT NULL DEFAULT 'mixed', -- Modified: modo_cobro to billing_mode
    minutes_to_hours_threshold INT NOT NULL DEFAULT 0, -- 0 = no threshold. Modified: paso_minutos_a_horas to minutes_to_hours_threshold
    hours_to_days_threshold INT NOT NULL DEFAULT 0,   -- 0 = no threshold. Modified: paso_horas_a_dias to hours_to_days_threshold
    hourly_rounding ENUM('up','exact') NOT NULL DEFAULT 'up', -- Modified: redondeo_horas to hourly_rounding
    daily_rounding ENUM('up','exact') NOT NULL DEFAULT 'up', -- Modified: redondeo_dias to daily_rounding
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    CONSTRAINT chk_rate_vehicle_type CHECK (vehicle_type IN ('car', 'motorcycle', 'bicycle')),
    CONSTRAINT chk_non_negative_values CHECK (
        hourly_rate >= 0 AND 
        minute_rate >= 0 AND 
        full_day_rate >= 0
    )
) ENGINE=InnoDB;

-- Check-ins/Check-outs Table (Movements)
CREATE TABLE movements (
    id_movement INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    id_vehicle INT NOT NULL,
    entry_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Modified: fecha_entrada to entry_date
    exit_date DATETIME, -- Modified: fecha_salida to exit_date
    id_rate INT NOT NULL,
    total_to_pay DECIMAL(10,2), -- Modified: total_a_pagar to total_to_pay
    id_user_entry INT NOT NULL, -- Modified: id_usuario_entrada to id_user_entry
    id_user_exit INT, -- Modified: id_usuario_salida to id_user_exit
    status ENUM('active', 'completed') DEFAULT 'active', -- Modified: estado to status and values to english
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    FOREIGN KEY (id_vehicle) REFERENCES vehicles(id_vehicle),
    FOREIGN KEY (id_rate) REFERENCES rates(id_rate),
    FOREIGN KEY (id_user_entry) REFERENCES users(id_user),
    FOREIGN KEY (id_user_exit) REFERENCES users(id_user),
    CONSTRAINT chk_dates CHECK (exit_date IS NULL OR exit_date >= entry_date)
) ENGINE=InnoDB;

-- Payments Table
CREATE TABLE payments (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_company INT NOT NULL,
    id_movement INT NOT NULL,
    payment_method ENUM('cash', 'card', 'QR') NOT NULL, -- Modified: metodo_pago to payment_method and values to english
    amount DECIMAL(10,2) NOT NULL, -- Modified: monto to amount
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Modified: fecha_pago to payment_date
    payment_reference VARCHAR(100), -- Modified: referencia_pago to payment_reference
    id_user INT NOT NULL,
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    FOREIGN KEY (id_movement) REFERENCES movements(id_movement),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('cash', 'card', 'QR')),
    CONSTRAINT chk_positive_amount CHECK (amount > 0)
) ENGINE=InnoDB;

-- Indexes for query optimization
CREATE INDEX idx_company_vehicle ON vehicles(id_company, license_plate);
CREATE INDEX idx_company_movements ON movements(id_company, entry_date);
CREATE INDEX idx_company_payments ON payments(id_company, payment_date);

-- View for active movements per company
CREATE VIEW v_active_movements AS
SELECT 
    m.id_movement,
    m.id_company,
    v.license_plate,
    v.type,
    m.entry_date,
    TIMEDIFF(CURRENT_TIMESTAMP, m.entry_date) as elapsed_time, -- Modified: tiempo_transcurrido to elapsed_time
    u.name as registered_by -- Modified: registrado_por to registered_by
FROM movements m
JOIN vehicles v ON m.id_vehicle = v.id_vehicle
JOIN users u ON m.id_user_entry = u.id_user
WHERE m.exit_date IS NULL;

-- View for daily income per company
CREATE VIEW v_daily_income AS
SELECT 
    p.id_company,
    DATE(p.payment_date) as date, -- Modified: fecha to date
    p.payment_method,
    COUNT(*) as payment_count, -- Modified: cantidad_pagos to payment_count
    SUM(p.amount) as total_income -- Modified: total_ingresos to total_income
FROM payments p
GROUP BY p.id_company, DATE(p.payment_date), p.payment_method;

-- Stored procedure to calculate the total to pay
DELIMITER //
CREATE PROCEDURE calculate_total_to_pay(
    IN p_id_movement INT,
    IN p_id_company INT,
    OUT p_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_entry_date DATETIME;
    DECLARE v_exit_date DATETIME;
    DECLARE v_hourly_rate DECIMAL(10,2);
    DECLARE v_minute_rate DECIMAL(10,2);
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_minutes INT;
    DECLARE v_days INT;
    DECLARE v_hours INT;
    DECLARE v_remaining_minutes INT;
    
    -- Get required data
    SELECT 
        m.entry_date,
        IFNULL(m.exit_date, CURRENT_TIMESTAMP),
        t.hourly_rate,
        t.minute_rate,
        t.full_day_rate
    INTO 
        v_entry_date,
        v_exit_date,
        v_hourly_rate,
        v_minute_rate,
        v_daily_rate
    FROM movements m
    JOIN rates t ON m.id_rate = t.id_rate
    WHERE m.id_movement = p_id_movement 
    AND m.id_company = p_id_company;
    
    -- Calculate difference in minutes
    SET v_minutes = TIMESTAMPDIFF(MINUTE, v_entry_date, v_exit_date);
    
    -- Calculate days, hours and minutes
    SET v_days = FLOOR(v_minutes / (24 * 60));
    SET v_remaining_minutes = v_minutes % (24 * 60);
    SET v_hours = FLOOR(v_remaining_minutes / 60);
    SET v_remaining_minutes = v_remaining_minutes % 60;
    
    -- Calculate total
    SET p_total = (v_days * v_daily_rate) + 
                  (v_hours * v_hourly_rate) + 
                  (v_remaining_minutes * v_minute_rate);
END //
DELIMITER ;

-- Cash Register Shifts Table per user
CREATE TABLE shifts (
    id_shift INT AUTO_INCREMENT PRIMARY KEY, -- Modified: turnos to shifts
    id_company INT NOT NULL,
    id_user INT NOT NULL,
    opening_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Modified: fecha_apertura to opening_date
    initial_base DECIMAL(12,2) NOT NULL, -- Modified: base_inicial to initial_base
    opening_observation VARCHAR(255), -- Modified: observacion_apertura to opening_observation
    closing_date DATETIME, -- Modified: fecha_cierre to closing_date
    total_cash DECIMAL(12,2), -- Modified: total_efectivo to total_cash
    total_card DECIMAL(12,2), -- Modified: total_tarjeta to total_card
    total_qr DECIMAL(12,2),
    total_general DECIMAL(12,2),
    difference DECIMAL(12,2), -- Modified: diferencia to difference
    closing_observation VARCHAR(255), -- Modified: observacion_cierre to closing_observation
    status ENUM('open','closed') NOT NULL DEFAULT 'open', -- Modified: estado to status and values to english
    FOREIGN KEY (id_company) REFERENCES companies(id_company),
    FOREIGN KEY (id_user) REFERENCES users(id_user),
    INDEX idx_active_shift (id_company, id_user, status)
) ENGINE=InnoDB;


-- Insert sample company
INSERT INTO companies (name, tax_id, address, phone, email, plan)
VALUES ('Central Parking', '900123456-7', 'Main Street #123', '3001234567', 'info@centralparking.com', 'premium');

-- Insert company settings
INSERT INTO company_settings (id_company, car_total_capacity, motorcycle_total_capacity, bicycle_total_capacity)
VALUES (1, 100, 50, 30);

-- Insert default administrator user
INSERT INTO users (id_company, name, username, password, role)
VALUES (1, 'Administrator', 'admin', '$2a$10$8GB5OFGTizEbMiuu1TSDWeAls/TRzA0l8EjWyahpk6Y6wXDYmTai6', 'admin');
 
-- Sample rates for company 1
INSERT INTO rates (id_company, vehicle_type, hourly_rate, minute_rate, full_day_rate, active)
VALUES
(1, 'car', 6000.00, 120.00, 30000.00, TRUE),
(1, 'motorcycle', 3000.00, 60.00, 15000.00, TRUE),
(1, 'bicycle', 1500.00, 30.00, 8000.00, TRUE);
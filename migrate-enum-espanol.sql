-- ============================================================
-- Migración: Valores ENUM a español
-- Ejecutar con: mysql -u cristian -pBoss parking_system < migrate-enum-espanol.sql
-- ============================================================

-- 1. Expandir ENUMs para aceptar valores nuevos Y viejos
ALTER TABLE vehicles MODIFY type ENUM('car', 'motorcycle', 'bicycle', 'carro', 'moto', 'bicicleta') NOT NULL;
ALTER TABLE rates MODIFY vehicle_type ENUM('car', 'motorcycle', 'bicycle', 'carro', 'moto', 'bicicleta') NOT NULL;
ALTER TABLE movements MODIFY status ENUM('active', 'completed', 'activo', 'completado') DEFAULT 'activo';
ALTER TABLE shifts MODIFY status ENUM('open', 'closed', 'abierto', 'cerrado') NOT NULL DEFAULT 'abierto';
ALTER TABLE payments MODIFY payment_method ENUM('cash', 'card', 'QR', 'efectivo', 'tarjeta') NOT NULL;
ALTER TABLE companies MODIFY plan ENUM('basic', 'premium', 'enterprise', 'basico', 'empresarial') NOT NULL;
ALTER TABLE rates MODIFY billing_mode ENUM('minute', 'hour', 'day', 'mixed', 'minuto', 'hora', 'dia', 'mixto') NOT NULL DEFAULT 'mixto';
ALTER TABLE rates MODIFY hourly_rounding ENUM('up', 'exact', 'arriba', 'exacto') NOT NULL DEFAULT 'arriba';
ALTER TABLE rates MODIFY daily_rounding ENUM('up', 'exact', 'arriba', 'exacto') NOT NULL DEFAULT 'arriba';

-- 2. Actualizar datos existentes a español
UPDATE vehicles SET type = 'carro' WHERE type = 'car';
UPDATE vehicles SET type = 'moto' WHERE type = 'motorcycle';
UPDATE vehicles SET type = 'bicicleta' WHERE type = 'bicycle';

UPDATE rates SET vehicle_type = 'carro' WHERE vehicle_type = 'car';
UPDATE rates SET vehicle_type = 'moto' WHERE vehicle_type = 'motorcycle';
UPDATE rates SET vehicle_type = 'bicicleta' WHERE vehicle_type = 'bicycle';

UPDATE movements SET status = 'activo' WHERE status = 'active';
UPDATE movements SET status = 'completado' WHERE status = 'completed';

UPDATE shifts SET status = 'abierto' WHERE status = 'open';
UPDATE shifts SET status = 'cerrado' WHERE status = 'closed';

UPDATE payments SET payment_method = 'efectivo' WHERE payment_method = 'cash';
UPDATE payments SET payment_method = 'tarjeta' WHERE payment_method = 'card';

UPDATE companies SET plan = 'basico' WHERE plan = 'basic';
UPDATE companies SET plan = 'empresarial' WHERE plan = 'enterprise';

UPDATE rates SET billing_mode = 'minuto' WHERE billing_mode = 'minute';
UPDATE rates SET billing_mode = 'hora' WHERE billing_mode = 'hour';
UPDATE rates SET billing_mode = 'dia' WHERE billing_mode = 'day';
UPDATE rates SET billing_mode = 'mixto' WHERE billing_mode = 'mixed';

UPDATE rates SET hourly_rounding = 'arriba' WHERE hourly_rounding = 'up';
UPDATE rates SET hourly_rounding = 'exacto' WHERE hourly_rounding = 'exact';
UPDATE rates SET daily_rounding = 'arriba' WHERE daily_rounding = 'up';
UPDATE rates SET daily_rounding = 'exacto' WHERE daily_rounding = 'exact';

-- 3. Restringir ENUMs a solo los valores en español
ALTER TABLE vehicles MODIFY type ENUM('carro', 'moto', 'bicicleta') NOT NULL;
ALTER TABLE rates MODIFY vehicle_type ENUM('carro', 'moto', 'bicicleta') NOT NULL;
ALTER TABLE movements MODIFY status ENUM('activo', 'completado') DEFAULT 'activo';
ALTER TABLE shifts MODIFY status ENUM('abierto', 'cerrado') NOT NULL DEFAULT 'abierto';
ALTER TABLE payments MODIFY payment_method ENUM('efectivo', 'tarjeta', 'QR') NOT NULL;
ALTER TABLE companies MODIFY plan ENUM('basico', 'premium', 'empresarial') NOT NULL;
ALTER TABLE rates MODIFY billing_mode ENUM('minuto', 'hora', 'dia', 'mixto') NOT NULL DEFAULT 'mixto';
ALTER TABLE rates MODIFY hourly_rounding ENUM('arriba', 'exacto') NOT NULL DEFAULT 'arriba';
ALTER TABLE rates MODIFY daily_rounding ENUM('arriba', 'exacto') NOT NULL DEFAULT 'arriba';

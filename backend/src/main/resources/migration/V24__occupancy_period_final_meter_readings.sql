-- Thêm cột số điện nước cuối cùng vào occupancy_periods
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS final_elec_reading NUMERIC(12,2);
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS final_water_reading NUMERIC(12,2);

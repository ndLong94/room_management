-- Giá điện/nước cố định theo tháng (đ/tháng) khi không dùng đồng hồ
ALTER TABLE rooms ADD COLUMN fixed_elec_amount NUMERIC(12,2) CHECK (fixed_elec_amount IS NULL OR fixed_elec_amount >= 0);
ALTER TABLE rooms ADD COLUMN fixed_water_amount NUMERIC(12,2) CHECK (fixed_water_amount IS NULL OR fixed_water_amount >= 0);

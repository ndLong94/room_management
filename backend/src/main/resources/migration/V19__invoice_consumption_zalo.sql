-- Chỉ số tiêu thụ điện (kWh), nước (m³) để hiển thị trong template gửi Zalo
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS elec_consumption NUMERIC(12,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS water_consumption NUMERIC(12,2);

-- Lưu tiền cọc, ngày cọc, ngày thanh toán, hợp đồng vào lịch sử khi chuyển phòng sang Còn trống
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(15,2);
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS deposit_date DATE;
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS payment_day INT;
ALTER TABLE occupancy_periods ADD COLUMN IF NOT EXISTS contract_url VARCHAR(1000);

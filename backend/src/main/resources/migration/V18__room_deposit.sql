-- Tiền đặt cọc và ngày cọc cho phòng
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(15,2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deposit_date DATE;

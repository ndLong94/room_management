-- Thêm cột đã cọc (deposit paid) cho phòng
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;

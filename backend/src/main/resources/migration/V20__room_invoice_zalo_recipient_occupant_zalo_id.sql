-- Người ở: Zalo User ID để nhận tin nhắn hóa đơn
ALTER TABLE occupants ADD COLUMN IF NOT EXISTS zalo_user_id VARCHAR(100);

-- Phòng: chọn 1 người ở làm người nhận tin Zalo hóa đơn
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS invoice_recipient_occupant_id BIGINT REFERENCES occupants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_rooms_invoice_recipient_occupant_id ON rooms(invoice_recipient_occupant_id);

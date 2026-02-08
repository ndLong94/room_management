-- Đoạn hội thoại reply admin/user lưu dạng JSON; status thêm RESOLVED (Đã giải quyết)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS conversation TEXT;

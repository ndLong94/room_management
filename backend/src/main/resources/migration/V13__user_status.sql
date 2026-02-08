-- User status: DRAFT (chờ duyệt), ACTIVE (được đăng nhập), INACTIVE (bị vô hiệu hóa)
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';
-- Existing users and admin can login
UPDATE app_user SET status = 'ACTIVE' WHERE status = 'DRAFT' OR status IS NULL;
-- New self-registered users start as DRAFT (handled in app)

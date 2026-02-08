-- User role (ADMIN / USER)
ALTER TABLE app_user ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';
UPDATE app_user SET role = 'ADMIN' WHERE username = 'admin';

-- Admin-set price per user (platform fee). One row per user.
CREATE TABLE IF NOT EXISTS user_platform_price (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
    amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
    note       VARCHAR(500),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_platform_price_user_id ON user_platform_price(user_id);

-- Payment history: admin records when a user paid platform fee
CREATE TABLE IF NOT EXISTS user_platform_payment (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    amount     NUMERIC(15,2) NOT NULL,
    paid_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note       VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_platform_payment_user_id ON user_platform_payment(user_id);
CREATE INDEX idx_user_platform_payment_paid_at ON user_platform_payment(paid_at);

CREATE TABLE pricing_settings (
    id             BIGSERIAL PRIMARY KEY,
    owner_user_id  BIGINT NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
    elec_price     DECIMAL(12, 4) NOT NULL DEFAULT 0,
    water_price    DECIMAL(12, 4) NOT NULL DEFAULT 0,
    currency       VARCHAR(10) NOT NULL DEFAULT 'VND',
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_settings_owner_user_id ON pricing_settings(owner_user_id);

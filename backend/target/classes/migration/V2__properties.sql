CREATE TABLE properties (
    id             BIGSERIAL PRIMARY KEY,
    owner_user_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    name           VARCHAR(255) NOT NULL,
    address        VARCHAR(500),
    note           TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_owner_user_id ON properties(owner_user_id);

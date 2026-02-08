-- Tenants: contract holder / person who pays (1 room has 1 active tenant in Phase 1)
CREATE TABLE tenants (
    id             BIGSERIAL PRIMARY KEY,
    owner_user_id  BIGINT NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    full_name      VARCHAR(255) NOT NULL,
    phone          VARCHAR(50),
    id_number      VARCHAR(50),
    id_type        VARCHAR(50),
    address        VARCHAR(500),
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenants_owner_user_id ON tenants(owner_user_id);

-- Room lease: links room to tenant (active = current lease)
CREATE TABLE room_leases (
    id             BIGSERIAL PRIMARY KEY,
    room_id        BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    tenant_id      BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    active         BOOLEAN NOT NULL DEFAULT true,
    move_in_date   DATE,
    move_out_date  DATE,
    deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_room_leases_room_id ON room_leases(room_id);
CREATE INDEX idx_room_leases_tenant_id ON room_leases(tenant_id);

-- Occupants: people actually living in the room (multiple per room)
CREATE TABLE occupants (
    id              BIGSERIAL PRIMARY KEY,
    room_id         BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    full_name       VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    id_number       VARCHAR(50),
    id_type         VARCHAR(50),
    address         VARCHAR(500),
    dob             DATE,
    avatar_url      VARCHAR(1000),
    id_front_url    VARCHAR(1000),
    id_back_url     VARCHAR(1000),
    note            TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_occupants_room_id ON occupants(room_id);

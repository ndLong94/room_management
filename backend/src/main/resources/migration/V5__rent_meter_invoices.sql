ALTER TABLE rooms ADD COLUMN rent_price DECIMAL(12, 2) NOT NULL DEFAULT 0;

CREATE TABLE meter_readings (
    id            BIGSERIAL PRIMARY KEY,
    room_id       BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    month         INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year          INTEGER NOT NULL,
    elec_reading  DECIMAL(12, 2) NOT NULL DEFAULT 0,
    water_reading DECIMAL(12, 2) NOT NULL DEFAULT 0,
    UNIQUE (room_id, month, year)
);

CREATE INDEX idx_meter_readings_room_month_year ON meter_readings(room_id, year, month);

CREATE TABLE invoices (
    id             BIGSERIAL PRIMARY KEY,
    room_id        BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    month          INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year           INTEGER NOT NULL,
    rent_amount    DECIMAL(12, 2) NOT NULL DEFAULT 0,
    elec_amount    DECIMAL(12, 2) NOT NULL DEFAULT 0,
    water_amount   DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_amount   DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount   DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status         VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID')),
    paid_at        TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (room_id, month, year)
);

CREATE INDEX idx_invoices_room_id ON invoices(room_id);
CREATE INDEX idx_invoices_month_year ON invoices(year, month);
CREATE INDEX idx_invoices_status ON invoices(status);

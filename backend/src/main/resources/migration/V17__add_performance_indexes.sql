-- Indexes to speed up frequent queries (lookups, list by owner, batch job, ordering).

-- Invoices: lookup by room + month + year (generate, findRoomIdsWithInvoice)
-- (meter_readings already has idx_meter_readings_room_month_year in V5)
CREATE INDEX IF NOT EXISTS idx_invoices_room_month_year ON invoices(room_id, month, year);

-- Rooms: list by property with order, and batch job by payment_day
CREATE INDEX IF NOT EXISTS idx_rooms_property_created ON rooms(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_payment_day ON rooms(payment_day) WHERE payment_day IS NOT NULL;

-- Properties: list by owner with order
CREATE INDEX IF NOT EXISTS idx_properties_owner_created ON properties(owner_user_id, created_at DESC);

-- Occupants: list by room with order
CREATE INDEX IF NOT EXISTS idx_occupants_room_created ON occupants(room_id, created_at DESC);

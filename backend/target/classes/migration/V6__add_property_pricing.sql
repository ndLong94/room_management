-- Property-level electricity and water pricing (VND/kWh, VND/m³)
-- Invoice calculation uses these; initial value = global default (can override per property)
ALTER TABLE properties
    ADD COLUMN elec_price NUMERIC(12, 2) NOT NULL DEFAULT 3500,
    ADD COLUMN water_price NUMERIC(12, 2) NOT NULL DEFAULT 15000;

COMMENT ON COLUMN properties.elec_price IS 'VND per kWh';
COMMENT ON COLUMN properties.water_price IS 'VND per m³';

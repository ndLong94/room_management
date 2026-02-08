-- Occupant: tạm trú tạm vắng (temporary residence registration)
ALTER TABLE occupants ADD COLUMN temp_residence_url VARCHAR(1000);

-- Room: hợp đồng nhà (rental contract)
ALTER TABLE rooms ADD COLUMN contract_url VARCHAR(1000);

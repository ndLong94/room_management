-- Chỉ số điện nước khởi điểm: nhập lúc chuyển status Trống -> Cho thuê; tháng đầu tính tiền = chỉ số hiện tại - chỉ số này
ALTER TABLE rooms ADD COLUMN initial_elec_reading NUMERIC(12,2) CHECK (initial_elec_reading IS NULL OR initial_elec_reading >= 0);
ALTER TABLE rooms ADD COLUMN initial_water_reading NUMERIC(12,2) CHECK (initial_water_reading IS NULL OR initial_water_reading >= 0);

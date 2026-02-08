-- Lịch sử cho thuê: mỗi kỳ khi chuyển phòng từ Đã cho thuê sang Còn trống
CREATE TABLE occupancy_periods (
    id              BIGSERIAL PRIMARY KEY,
    room_id         BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    property_id     BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    start_month     INT,
    start_year      INT,
    end_month       INT NOT NULL,
    end_year        INT NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_occupancy_periods_room_id ON occupancy_periods(room_id);

-- Snapshot người ở tại thời điểm kết thúc kỳ (để xem lại lịch sử)
CREATE TABLE occupancy_period_occupants (
    id                   BIGSERIAL PRIMARY KEY,
    period_id            BIGINT NOT NULL REFERENCES occupancy_periods(id) ON DELETE CASCADE,
    full_name            VARCHAR(255) NOT NULL,
    phone                VARCHAR(50),
    id_number            VARCHAR(50),
    id_type              VARCHAR(50),
    address              VARCHAR(500),
    dob                  DATE,
    avatar_url           VARCHAR(1000),
    id_front_url         VARCHAR(1000),
    id_back_url          VARCHAR(1000),
    temp_residence_url   VARCHAR(1000),
    note                 TEXT,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_occupancy_period_occupants_period_id ON occupancy_period_occupants(period_id);

-- User feedback (đóng góp ý kiến)
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    admin_note VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

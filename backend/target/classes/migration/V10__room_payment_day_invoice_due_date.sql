-- Ngày thanh toán của phòng (1-31): hóa đơn tự động tạo vào 6h sáng ngày này
ALTER TABLE rooms ADD COLUMN payment_day INT CHECK (payment_day IS NULL OR (payment_day >= 1 AND payment_day <= 31));

-- Ngày hóa đơn (để hiển thị ngày/tháng/năm)
ALTER TABLE invoices ADD COLUMN due_date DATE;

-- Backfill due_date from month/year (ngày 1)
UPDATE invoices SET due_date = MAKE_DATE(year, month, 1) WHERE due_date IS NULL;

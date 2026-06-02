ALTER TABLE payments
ADD COLUMN receipt_no TEXT;

ALTER TABLE payments
ADD COLUMN discount_amount NUMERIC DEFAULT 0;

ALTER TABLE payments
ADD COLUMN reference_no TEXT;

ALTER TABLE payments
ADD COLUMN deposit_to TEXT;
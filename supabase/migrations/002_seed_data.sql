-- Optional seed data for development

INSERT INTO customers (name, email, phone, address) VALUES
  ('Rajesh Kumar', 'rajesh@email.com', '+91 98765 43210', 'Chennai'),
  ('Anita Sharma', 'anita@email.com', '+91 98765 43211', 'Bangalore'),
  ('Vikram Enterprises', 'vikram@buildright.com', '+91 98765 43212', 'Hyderabad'),
  ('Priya Menon', 'priya@email.com', '+91 98765 43213', 'Kochi'),
  ('BuildRight Constructions', 'contact@buildright.com', '+91 98765 43214', 'Mumbai');

INSERT INTO vendors (name, contact_person, phone) VALUES
  ('Premium Woodcraft', 'Suresh', '+91 90001 00001'),
  ('Metro Hardware Co.', 'Ravi', '+91 90001 00002'),
  ('Elite Glass & Doors', 'Meera', '+91 90001 00003'),
  ('Interior Solutions Ltd.', 'Arun', '+91 90001 00004'),
  ('Safety Doors India', 'Kiran', '+91 90001 00005'),
  ('SecureEntry Systems', 'Deepak', '+91 90001 00006'),
  ('AluFrame Industries', 'Nisha', '+91 90001 00007'),
  ('AutoDoor Technologies', 'Vijay', '+91 90001 00008');

-- Orders (using explicit order numbers for seed)
INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT c.id, 'DH-2026-1042', 'Green Valley Apartments — Block A', 'Partial', 142500
FROM customers c WHERE c.name = 'Rajesh Kumar';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT c.id, 'DH-2026-1038', 'Sunrise Villa — Phase 2', 'Paid', 156000
FROM customers c WHERE c.name = 'Anita Sharma';

INSERT INTO orders (customer_id, order_number, project_name, payment_status, paid_amount)
SELECT c.id, 'DH-2026-1035', 'Office Renovation — 3rd Floor', 'Pending', 0
FROM customers c WHERE c.name = 'Vikram Enterprises';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Main Entrance Door — Teak', 'Installation Scheduled', 95000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1042' AND v.name = 'Premium Woodcraft';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Bedroom Doors (3) — Flush', 'Ready', 72000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1042' AND v.name = 'Metro Hardware Co.';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, NULL, 'Bathroom Door — Waterproof', 'Measurement Pending', 38000
FROM orders o WHERE o.order_number = 'DH-2026-1042';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'French Door — Living Room', 'Completed', 88000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1038' AND v.name = 'Elite Glass & Doors';

INSERT INTO order_items (order_id, vendor_id, name, status, amount)
SELECT o.id, v.id, 'Sliding Wardrobe Shutter', 'Installed', 68000
FROM orders o, vendors v
WHERE o.order_number = 'DH-2026-1038' AND v.name = 'Interior Solutions Ltd.';

INSERT INTO payments (order_id, amount, payment_date, method)
SELECT o.id, 142500, '2026-05-20', 'Bank Transfer'
FROM orders o WHERE o.order_number = 'DH-2026-1042';

INSERT INTO payments (order_id, amount, payment_date, method)
SELECT o.id, 156000, '2026-05-18', 'UPI'
FROM orders o WHERE o.order_number = 'DH-2026-1038';

SELECT setval('order_number_seq', 1043);

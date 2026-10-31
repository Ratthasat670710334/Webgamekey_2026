BEGIN;

-- เพิ่ม Admin และ ลูกค้า
INSERT INTO users (username, password_hash, email, role, status) VALUES
('admin_boss', 'pass1234', 'admin@test.com', 'admin', 'active'),
('player_one', 'pass1234', 'p1@test.com', 'customer', 'active'),
('bad_player', 'pass1234', 'bad@test.com', 'customer', 'suspended');

-- เพิ่มแพ็กเกจคูปองเกม
INSERT INTO coupon_packages (game_name, title, description, price, max_per_user) VALUES
('ROV', 'คูปองสกินแรร์ 100 คูปอง', 'ใช้สำหรับแลกสกินระดับ Limited ในเกม ROV', 99.00, 2),
('Valorant', 'Valorant Points 500 VP', 'เติมพอยท์เข้าเกมทันที', 150.00, 5);

-- เพิ่มรหัสคูปอง (Stock)
INSERT INTO coupon_codes (package_id, coupon_code, status) VALUES
(1, 'ROV-AAAA-1111', 'sold'),      -- ขายไปแล้ว (code_id = 1)
(1, 'ROV-BBBB-2222', 'available'), -- พร้อมขาย (code_id = 2)
(1, 'ROV-CCCC-3333', 'available'), -- พร้อมขาย (code_id = 3)
(2, 'VALO-XXXX-9999', 'available'); -- พร้อมขาย (code_id = 4)

-- เพิ่มประวัติการซื้อ (สมมติว่า player_one ซื้อโค้ดแรกไปแล้ว)
INSERT INTO orders (user_id, code_id, purchase_price) VALUES
(2, 1, 99.00);

COMMIT;
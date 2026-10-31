BEGIN;

-- 1. ตารางผู้ใช้งาน (Users: Admin & Customer)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY, -- ใช้ SERIAL สำหรับรันเลขอัตโนมัติ
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    -- ใช้ CHECK แทน ENUM เพื่อจำกัดค่าที่ใส่ได้
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางแพ็กเกจคูปอง (Coupon Packages)
CREATE TABLE coupon_packages (
    package_id SERIAL PRIMARY KEY,
    game_name VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL, -- ใน Postgres นิยมใช้ NUMERIC แทน DECIMAL
    max_per_user INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ตารางรหัสคูปอง (Coupon Codes) - เก็บ Code ที่ไม่ซ้ำกัน
CREATE TABLE coupon_codes (
    code_id SERIAL PRIMARY KEY,
    package_id INT NOT NULL REFERENCES coupon_packages(package_id) ON DELETE CASCADE,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold'))
);

-- 4. ตารางประวัติการสั่งซื้อ (Orders / Purchase History)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    code_id INT NOT NULL UNIQUE REFERENCES coupon_codes(code_id), -- UNIQUE เพื่อป้องกันการขายโค้ดซ้ำ
    purchase_price NUMERIC(10, 2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



COMMIT;
BEGIN;

-- 1. ตารางผู้ใช้งาน (Users: Admin & Customer)
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS coupon_packages (
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
CREATE TABLE IF NOT EXISTS coupon_codes (
    code_id SERIAL PRIMARY KEY,
    package_id INT NOT NULL REFERENCES coupon_packages(package_id) ON DELETE CASCADE,
    coupon_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold'))
);

-- 4. ตารางประวัติการสั่งซื้อ (Orders / Purchase History)
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    code_id INT NOT NULL UNIQUE REFERENCES coupon_codes(code_id), -- UNIQUE เพื่อป้องกันการขายโค้ดซ้ำ
    purchase_price NUMERIC(10, 2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product catalog used by the GAMEKEY storefront.
CREATE TABLE IF NOT EXISTS games (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    genre VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) NOT NULL CHECK (discount_price >= 0),
    discount INT NOT NULL CHECK (discount BETWEEN 0 AND 100),
    rating NUMERIC(3, 1) NOT NULL CHECK (rating BETWEEN 0 AND 10),
    platform VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    poster TEXT NOT NULL,
    detail TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'พร้อมจำหน่าย',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_orders (
    order_id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'ชำระเงินสำเร็จ',
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_keys (
    key_id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    key_code VARCHAR(255) NOT NULL UNIQUE,
    order_id BIGINT REFERENCES game_orders(order_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS game_keys_available_idx ON game_keys(game_id, key_id) WHERE order_id IS NULL;
CREATE INDEX IF NOT EXISTS game_orders_user_purchased_idx ON game_orders(user_id, purchased_at DESC);

COMMIT;
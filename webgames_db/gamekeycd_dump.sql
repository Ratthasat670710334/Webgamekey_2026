-- GAMEKEY schema and catalog seed. Safe to re-run; no DROP statements.

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
BEGIN;

INSERT INTO games (id, title, genre, price, discount_price, discount, rating, platform, region, poster, detail, status)
VALUES
  (1, 'ELDEN RING', 'RPG', 1490, 899, 40, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg', 'เกม Action RPG ในโลกแฟนตาซีที่เต็มไปด้วยการผจญภัยและศัตรูที่ท้าทาย', 'พร้อมจำหน่าย'),
  (2, 'Cyberpunk 2077', 'Action', 1790, 699, 61, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg', 'เกม Open World ในเมือง Night City ที่เต็มไปด้วยเทคโนโลยีและภารกิจ', 'พร้อมจำหน่าย'),
  (3, 'Red Dead Redemption 2', 'Adventure', 1890, 799, 58, 9.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg', 'เกมผจญภัยโลกเปิดในยุคคาวบอย สำรวจโลกและเรื่องราวของแก๊งอาชญากร', 'พร้อมจำหน่าย'),
  (4, 'Grand Theft Auto V', 'Action', 1190, 399, 66, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg', 'เกม Open World ที่ให้สำรวจเมือง Los Santos และทำภารกิจหลากหลาย', 'พร้อมจำหน่าย'),
  (5, 'Hogwarts Legacy', 'Adventure', 1790, 699, 61, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg', 'เกมผจญภัยในโลกเวทมนตร์ของ Hogwarts พร้อมการเรียนรู้คาถา', 'พร้อมจำหน่าย'),
  (6, 'Baldur''s Gate 3', 'RPG', 1599, 1099, 31, 9.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg', 'เกม RPG ที่มีเนื้อเรื่องแตกแขนงและระบบต่อสู้แบบวางแผน', 'พร้อมจำหน่าย'),
  (7, 'Black Myth: Wukong', 'Action', 1890, 1290, 32, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg', 'เกม Action RPG ที่ได้รับแรงบันดาลใจจากตำนานไซอิ๋ว', 'พร้อมจำหน่าย'),
  (8, 'Forza Horizon 5', 'Racing', 1290, 599, 54, 9.1, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg', 'เกมแข่งรถโลกเปิดในประเทศเม็กซิโก', 'พร้อมจำหน่าย'),
  (9, 'Resident Evil 4', 'Horror', 1490, 799, 46, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg', 'เกม Survival Horror ที่ติดตามภารกิจช่วยเหลือลูกสาวประธานาธิบดี', 'พร้อมจำหน่าย'),
  (10, 'HELLDIVERS 2', 'Action', 1290, 899, 30, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg', 'เกมยิงแบบร่วมมือกันต่อสู้กับศัตรูจากต่างดาว', 'พร้อมจำหน่าย'),
  (11, 'Stardew Valley', 'Simulation', 315, 189, 40, 9.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg', 'เกมจำลองการทำฟาร์ม ใช้ชีวิตในชนบทและสร้างความสัมพันธ์กับชาวเมือง', 'พร้อมจำหน่าย'),
  (12, 'Hades', 'Action', 460, 230, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg', 'เกม Roguelike Action ต่อสู้เพื่อหลบหนีจากยมโลก', 'พร้อมจำหน่าย'),
  (13, 'Hades II', 'Action', 590, 472, 20, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg', 'เกม Roguelike Action ผจญภัยในยมโลกด้วยตัวละครและพลังใหม่', 'พร้อมจำหน่าย'),
  (14, 'Hollow Knight', 'Adventure', 315, 157, 50, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg', 'เกม Metroidvania สำรวจอาณาจักรใต้ดิน Hallownest', 'พร้อมจำหน่าย'),
  (15, 'Hollow Knight: Silksong', 'Adventure', 590, 531, 10, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/header.jpg', 'เกมผจญภัย Metroidvania ที่เน้นการสำรวจและการต่อสู้', 'พร้อมจำหน่าย'),
  (16, 'Sekiro: Shadows Die Twice', 'Action', 1990, 995, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg', 'เกม Action ผจญภัยในญี่ปุ่นยุคเซ็นโกคุ', 'พร้อมจำหน่าย'),
  (17, 'Dark Souls III', 'RPG', 1590, 795, 50, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg', 'เกม Action RPG ต่อสู้กับศัตรูและบอสสุดท้าทาย', 'พร้อมจำหน่าย'),
  (18, 'Lies of P', 'RPG', 1690, 845, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1627720/header.jpg', 'เกม Soulslike ที่ตีความเรื่องพิน็อกคิโอในโลกดาร์กแฟนตาซี', 'พร้อมจำหน่าย'),
  (19, 'Monster Hunter: World', 'Action', 990, 495, 50, 9.1, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg', 'เกมล่าสัตว์ประหลาดขนาดใหญ่และสร้างอุปกรณ์จากวัตถุดิบ', 'พร้อมจำหน่าย'),
  (20, 'Monster Hunter Rise', 'Action', 990, 495, 50, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1446780/header.jpg', 'เกมล่ามอนสเตอร์พร้อมระบบการเคลื่อนไหวที่รวดเร็ว', 'พร้อมจำหน่าย'),
  (21, 'The Witcher 3: Wild Hunt', 'RPG', 1090, 219, 80, 9.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg', 'เกม RPG โลกเปิด รับบท Geralt นักล่าปีศาจ', 'พร้อมจำหน่าย'),
  (22, 'The Elder Scrolls V: Skyrim Special Edition', 'RPG', 1390, 417, 70, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg', 'เกม RPG โลกเปิดในดินแดน Skyrim', 'พร้อมจำหน่าย'),
  (23, 'Fallout 4', 'RPG', 990, 330, 67, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg', 'เกม RPG โลกหลังหายนะที่ผู้เล่นสำรวจดินแดนรกร้าง', 'พร้อมจำหน่าย'),
  (24, 'BORDERLANDS 3', 'Action', 1590, 318, 80, 8.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/397540/header.jpg', 'เกมยิงมุมมองบุคคลที่หนึ่งผสมระบบสะสมอุปกรณ์', 'พร้อมจำหน่าย'),
  (25, 'DOOM Eternal', 'Action', 1290, 387, 70, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg', 'เกมยิงรวดเร็วต่อสู้กับปีศาจจากนรก', 'พร้อมจำหน่าย'),
  (26, 'Cyberpunk 2077: Phantom Liberty', 'Action', 799, 639, 20, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2138330/header.jpg', 'ส่วนเสริมเนื้อเรื่องของ Cyberpunk 2077 ในเขต Dogtown', 'พร้อมจำหน่าย'),
  (27, 'The Last of Us Part I', 'Adventure', 1690, 845, 50, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg', 'เกมผจญภัยเอาชีวิตรอดในโลกหลังการระบาด', 'พร้อมจำหน่าย'),
  (28, 'God of War', 'Action', 1390, 695, 50, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg', 'เกม Action ผจญภัยของ Kratos และ Atreus ในดินแดนนอร์ส', 'พร้อมจำหน่าย'),
  (29, 'God of War Ragnarök', 'Action', 1690, 1352, 20, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg', 'เกม Action ผจญภัยที่สานต่อเรื่องราวของ Kratos', 'พร้อมจำหน่าย'),
  (30, 'Marvel''s Spider-Man Remastered', 'Action', 1690, 845, 50, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg', 'เกม Action โลกเปิดที่ให้สวมบท Spider-Man', 'พร้อมจำหน่าย'),
  (31, 'Marvel''s Spider-Man: Miles Morales', 'Action', 1290, 645, 50, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817190/header.jpg', 'เกม Action ผจญภัยของ Miles Morales ในนิวยอร์ก', 'พร้อมจำหน่าย'),
  (32, 'UNCHARTED: Legacy of Thieves Collection', 'Adventure', 1690, 845, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1659420/header.jpg', 'รวมเกมผจญภัยล่าสมบัติและสำรวจโบราณสถาน', 'พร้อมจำหน่าย'),
  (33, 'Horizon Zero Dawn Complete Edition', 'Adventure', 1090, 327, 70, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/header.jpg', 'เกม Action RPG โลกเปิดที่มนุษย์อยู่ร่วมกับจักรกล', 'พร้อมจำหน่าย'),
  (34, 'Horizon Forbidden West Complete Edition', 'Adventure', 1690, 1352, 20, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg', 'เกมผจญภัยโลกเปิดในดินแดนหลังอารยธรรมล่มสลาย', 'พร้อมจำหน่าย'),
  (35, 'Days Gone', 'Action', 1290, 387, 70, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/header.jpg', 'เกมเอาชีวิตรอดจากฝูง Freakers ในโลกหลังหายนะ', 'พร้อมจำหน่าย'),
  (36, 'Death Stranding Director''s Cut', 'Adventure', 1290, 645, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg', 'เกมผจญภัยส่งของเชื่อมต่อผู้คนในโลกที่ล่มสลาย', 'พร้อมจำหน่าย'),
  (37, 'Control Ultimate Edition', 'Action', 990, 297, 70, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/870780/header.jpg', 'เกม Action เหนือธรรมชาติภายในอาคารลึกลับ', 'พร้อมจำหน่าย'),
  (38, 'Alan Wake 2', 'Horror', 1490, 1192, 20, 9.1, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1087100/header.jpg', 'เกม Survival Horror สลับเรื่องราวของนักเขียนและเจ้าหน้าที่ FBI', 'พร้อมจำหน่าย'),
  (39, 'The Outlast Trials', 'Horror', 990, 693, 30, 8.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1304930/header.jpg', 'เกมสยองขวัญเอาชีวิตรอดที่เล่นร่วมกับเพื่อนได้', 'พร้อมจำหน่าย'),
  (40, 'Phasmophobia', 'Horror', 315, 252, 20, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg', 'เกมสืบสวนผีโดยใช้อุปกรณ์ตรวจจับปรากฏการณ์เหนือธรรมชาติ', 'พร้อมจำหน่าย'),
  (41, 'Lethal Company', 'Horror', 315, 252, 20, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1966720/header.jpg', 'เกมร่วมมือกันเก็บเศษซากบนดวงจันทร์อันตราย', 'พร้อมจำหน่าย'),
  (42, 'Sons Of The Forest', 'Horror', 590, 413, 30, 8.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1326470/header.jpg', 'เกมเอาชีวิตรอดบนเกาะลึกลับที่เต็มไปด้วยสิ่งมีชีวิตประหลาด', 'พร้อมจำหน่าย'),
  (43, 'Dying Light 2 Stay Human', 'Action', 1790, 537, 70, 8.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/header.jpg', 'เกม Action โลกเปิดที่มีซอมบี้และระบบ Parkour', 'พร้อมจำหน่าย'),
  (44, 'Dead by Daylight', 'Horror', 599, 299, 50, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg', 'เกมสยองขวัญแบบหลายผู้เล่นหนึ่งคนเป็นฆาตกร', 'พร้อมจำหน่าย'),
  (45, 'The Forest', 'Horror', 315, 157, 50, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg', 'เกมเอาชีวิตรอดหลังเครื่องบินตกบนเกาะป่า', 'พร้อมจำหน่าย'),
  (46, 'Subnautica', 'Adventure', 590, 295, 50, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg', 'เกมเอาชีวิตรอดและสำรวจใต้มหาสมุทรต่างดาว', 'พร้อมจำหน่าย'),
  (47, 'Subnautica: Below Zero', 'Adventure', 590, 354, 40, 8.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/848450/header.jpg', 'เกมสำรวจเอาชีวิตรอดในมหาสมุทรเขตน้ำแข็ง', 'พร้อมจำหน่าย'),
  (48, 'No Man''s Sky', 'Adventure', 1190, 595, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg', 'เกมสำรวจอวกาศและดาวเคราะห์จำนวนมหาศาล', 'พร้อมจำหน่าย'),
  (49, 'Sea of Thieves', 'Adventure', 1290, 645, 50, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172620/header.jpg', 'เกมผจญภัยโจรสลัดและออกเดินเรือกับเพื่อน', 'พร้อมจำหน่าย'),
  (50, 'Raft', 'Adventure', 460, 230, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg', 'เกมเอาชีวิตรอดบนแพกลางมหาสมุทร', 'พร้อมจำหน่าย'),
  (51, 'Minecraft Dungeons', 'Action', 799, 559, 30, 8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1672970/header.jpg', 'เกม Action RPG ผจญภัยในดันเจี้ยนของจักรวาล Minecraft', 'พร้อมจำหน่าย'),
  (52, 'Terraria', 'Adventure', 315, 157, 50, 9.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg', 'เกม Sandbox สำรวจ ขุดแร่ สร้างสิ่งของและต่อสู้', 'พร้อมจำหน่าย'),
  (53, 'Factorio', 'Simulation', 700, 560, 20, 9.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg', 'เกมสร้างโรงงานและระบบอัตโนมัติบนดาวต่างดาว', 'พร้อมจำหน่าย'),
  (54, 'Satisfactory', 'Simulation', 990, 792, 20, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/526870/header.jpg', 'เกมสร้างโรงงานสามมิติและจัดการสายการผลิต', 'พร้อมจำหน่าย'),
  (55, 'Cities: Skylines', 'Simulation', 990, 247, 75, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/255710/header.jpg', 'เกมจำลองการสร้างและบริหารเมือง', 'พร้อมจำหน่าย'),
  (56, 'Cities: Skylines II', 'Simulation', 1490, 1192, 20, 7.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/949230/header.jpg', 'เกมจำลองการสร้างเมืองพร้อมระบบบริหารที่ละเอียดขึ้น', 'พร้อมจำหน่าย'),
  (57, 'The Sims 4', 'Simulation', 0, 0, 0, 8.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg', 'เกมจำลองชีวิต สร้างตัวละคร บ้าน และเรื่องราวของครอบครัว', 'พร้อมจำหน่าย'),
  (58, 'Planet Zoo', 'Simulation', 1290, 645, 50, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/703080/header.jpg', 'เกมสร้างและบริหารสวนสัตว์', 'พร้อมจำหน่าย'),
  (59, 'Planet Coaster', 'Simulation', 1090, 327, 70, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/493340/header.jpg', 'เกมสร้างสวนสนุกและรถไฟเหาะ', 'พร้อมจำหน่าย'),
  (60, 'Euro Truck Simulator 2', 'Simulation', 460, 230, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/227300/header.jpg', 'เกมจำลองการขับรถบรรทุกส่งสินค้าทั่วยุโรป', 'พร้อมจำหน่าย'),
  (61, 'American Truck Simulator', 'Simulation', 460, 230, 50, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/270880/header.jpg', 'เกมจำลองการขับรถบรรทุกเดินทางในสหรัฐอเมริกา', 'พร้อมจำหน่าย'),
  (62, 'Microsoft Flight Simulator', 'Simulation', 1990, 1492, 25, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg', 'เกมจำลองการบินพร้อมแผนที่โลก', 'พร้อมจำหน่าย'),
  (63, 'House Flipper', 'Simulation', 460, 230, 50, 8.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/613100/header.jpg', 'เกมปรับปรุง ซ่อมแซม และตกแต่งบ้าน', 'พร้อมจำหน่าย'),
  (64, 'PowerWash Simulator', 'Simulation', 460, 322, 30, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1290000/header.jpg', 'เกมจำลองการทำความสะอาดด้วยเครื่องฉีดน้ำแรงดันสูง', 'พร้อมจำหน่าย'),
  (65, 'Car Mechanic Simulator 2021', 'Simulation', 590, 295, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1190000/header.jpg', 'เกมจำลองการซ่อมและปรับแต่งรถยนต์', 'พร้อมจำหน่าย'),
  (66, 'F1 24', 'Racing', 1790, 895, 50, 8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2488620/header.jpg', 'เกมแข่งรถ Formula One พร้อมทีมและสนามแข่งขัน', 'พร้อมจำหน่าย'),
  (67, 'Assetto Corsa', 'Racing', 590, 118, 80, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/244210/header.jpg', 'เกมแข่งรถจำลองฟิสิกส์การขับขี่', 'พร้อมจำหน่าย'),
  (68, 'Assetto Corsa Competizione', 'Racing', 990, 495, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/805550/header.jpg', 'เกมแข่งรถ GT ที่เน้นความสมจริง', 'พร้อมจำหน่าย'),
  (69, 'Need for Speed Heat', 'Racing', 1390, 278, 80, 8.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/header.jpg', 'เกมแข่งรถบนถนนและหลบหนีตำรวจ', 'พร้อมจำหน่าย'),
  (70, 'The Crew Motorfest', 'Racing', 1490, 1043, 30, 8.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2698940/header.jpg', 'เกมแข่งรถโลกเปิดบนเกาะฮาวาย', 'พร้อมจำหน่าย'),
  (71, 'Trackmania', 'Racing', 0, 0, 0, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2225070/header.jpg', 'เกมแข่งรถจับเวลาบนสนามที่ผู้เล่นสร้างได้', 'พร้อมจำหน่าย'),
  (72, 'Dirt Rally 2.0', 'Racing', 990, 198, 80, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/690790/header.jpg', 'เกมแข่งรถแรลลีบนเส้นทางหลากหลาย', 'พร้อมจำหน่าย'),
  (73, 'Wreckfest', 'Racing', 990, 396, 60, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/228380/header.jpg', 'เกมแข่งรถชนทำลายที่เน้นฟิสิกส์', 'พร้อมจำหน่าย'),
  (74, 'F1 Manager 2024', 'Strategy', 990, 495, 50, 8.1, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2591280/header.jpg', 'เกมบริหารทีมแข่งรถ Formula One', 'พร้อมจำหน่าย'),
  (75, 'Civilization VI', 'Strategy', 990, 247, 75, 9.1, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg', 'เกมวางแผนสร้างอารยธรรมตั้งแต่ยุคโบราณ', 'พร้อมจำหน่าย'),
  (76, 'Age of Empires IV', 'Strategy', 1290, 645, 50, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg', 'เกมวางแผนการรบและสร้างอาณาจักรแบบเรียลไทม์', 'พร้อมจำหน่าย'),
  (77, 'Total War: WARHAMMER III', 'Strategy', 1790, 895, 50, 8.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1142710/header.jpg', 'เกมวางแผนสงครามแฟนตาซีขนาดใหญ่', 'พร้อมจำหน่าย'),
  (78, 'XCOM 2', 'Strategy', 990, 148, 85, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268500/header.jpg', 'เกมวางแผนผลัดตาต่อสู้กับกองกำลังเอเลียน', 'พร้อมจำหน่าย'),
  (79, 'RimWorld', 'Simulation', 990, 792, 20, 9.6, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg', 'เกมจำลองการสร้างอาณานิคมและเอาชีวิตรอด', 'พร้อมจำหน่าย'),
  (80, 'Oxygen Not Included', 'Simulation', 460, 230, 50, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/457140/header.jpg', 'เกมจำลองการจัดการฐานใต้ดินและทรัพยากร', 'พร้อมจำหน่าย'),
  (81, 'Slay the Spire', 'Strategy', 460, 230, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg', 'เกมการ์ด Roguelike สร้างเด็คเพื่อพิชิตหอคอย', 'พร้อมจำหน่าย'),
  (82, 'Vampire Survivors', 'Action', 169, 84, 50, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1794680/header.jpg', 'เกมเอาชีวิตรอดจากฝูงศัตรูด้วยการอัปเกรดอาวุธ', 'พร้อมจำหน่าย'),
  (83, 'Balatro', 'Strategy', 315, 252, 20, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg', 'เกมไพ่ Roguelike ผสมการสร้างคอมโบโป๊กเกอร์', 'พร้อมจำหน่าย'),
  (84, 'Among Us', 'Indie', 169, 84, 50, 8.7, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg', 'เกมปาร์ตี้ค้นหาผู้แอบแฝงในทีม', 'พร้อมจำหน่าย'),
  (85, 'Cuphead', 'Action', 590, 295, 50, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg', 'เกมแพลตฟอร์มต่อสู้บอสด้วยภาพสไตล์การ์ตูนยุคเก่า', 'พร้อมจำหน่าย'),
  (86, 'Celeste', 'Indie', 460, 230, 50, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg', 'เกมแพลตฟอร์มปีนเขาที่เน้นความแม่นยำและเรื่องราว', 'พร้อมจำหน่าย'),
  (87, 'Undertale', 'RPG', 199, 99, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/header.jpg', 'เกม RPG ที่การตัดสินใจของผู้เล่นส่งผลต่อเรื่องราว', 'พร้อมจำหน่าย'),
  (88, 'DAVE THE DIVER', 'Adventure', 590, 472, 20, 9.3, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1868140/header.jpg', 'เกมสำรวจทะเลและบริหารร้านซูชิ', 'พร้อมจำหน่าย'),
  (89, 'Sea of Stars', 'RPG', 590, 413, 30, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1244090/header.jpg', 'เกม RPG ผลัดตาที่ได้แรงบันดาลใจจากเกมคลาสสิก', 'พร้อมจำหน่าย'),
  (90, 'Disco Elysium - The Final Cut', 'RPG', 990, 247, 75, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632360/header.jpg', 'เกม RPG สืบสวนที่เน้นบทสนทนาและการตัดสินใจ', 'พร้อมจำหน่าย'),
  (91, 'Persona 5 Royal', 'RPG', 1990, 995, 50, 9.5, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg', 'เกม JRPG ที่ติดตามกลุ่ม Phantom Thieves', 'พร้อมจำหน่าย'),
  (92, 'Like a Dragon: Infinite Wealth', 'RPG', 1990, 1393, 30, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2072450/header.jpg', 'เกม RPG ผจญภัยในญี่ปุ่นและฮาวาย', 'พร้อมจำหน่าย'),
  (93, 'FINAL FANTASY VII REMAKE INTERGRADE', 'RPG', 1990, 995, 50, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/header.jpg', 'เกม RPG แอ็กชันรีเมกเรื่องราว Final Fantasy VII', 'พร้อมจำหน่าย'),
  (94, 'NieR:Automata', 'RPG', 1190, 476, 60, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/524220/header.jpg', 'เกม Action RPG ในโลกอนาคตที่มนุษย์ต่อสู้ผ่านแอนดรอยด์', 'พร้อมจำหน่าย'),
  (95, 'DOOM', 'Action', 990, 198, 80, 9.2, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/379720/header.jpg', 'เกมยิงมุมมองบุคคลที่หนึ่งต่อสู้กับปีศาจ', 'พร้อมจำหน่าย'),
  (96, 'Titanfall 2', 'Action', 990, 99, 90, 9.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1237970/header.jpg', 'เกมยิง Sci-fi ที่มีทั้งการต่อสู้ของนักบินและหุ่นยนต์ Titan', 'พร้อมจำหน่าย'),
  (97, 'Apex Legends', 'Action', 0, 0, 0, 8.4, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg', 'เกม Battle Royale แบบทีมที่มีตัวละครและความสามารถเฉพาะ', 'พร้อมจำหน่าย'),
  (98, 'Counter-Strike 2', 'Action', 0, 0, 0, 8.8, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg', 'เกมยิงแข่งขันแบบทีมวางระเบิดและต่อต้าน', 'พร้อมจำหน่าย'),
  (99, 'Dota 2', 'Strategy', 0, 0, 0, 8.9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/header.jpg', 'เกม MOBA แข่งขันแบบทีมโดยเลือกฮีโร่และวางแผน', 'พร้อมจำหน่าย'),
  (100, 'Team Fortress 2', 'Action', 0, 0, 0, 9, 'Steam', 'Global', 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/440/header.jpg', 'เกมยิงแบบทีมที่มีคลาสตัวละครและรูปแบบการเล่นหลากหลาย', 'พร้อมจำหน่าย')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title, genre = EXCLUDED.genre, price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price, discount = EXCLUDED.discount,
    rating = EXCLUDED.rating, platform = EXCLUDED.platform, region = EXCLUDED.region,
    poster = EXCLUDED.poster, detail = EXCLUDED.detail, status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

SELECT setval(pg_get_serial_sequence('games', 'id'), COALESCE((SELECT max(id) FROM games), 1), true);

COMMIT;

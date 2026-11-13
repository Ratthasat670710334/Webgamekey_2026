# โครงสร้าง Frontend / Backend ของ GAMEKEY STORE

เอกสารนี้อธิบายโค้ดที่อยู่ใน repository โดยเน้นว่า **รับข้อมูลจากไหน → ส่ง API/ประมวลผลอย่างไร → ได้ output อะไร** แยกเส้นทางร้านค้า GAMEKEY ที่ใช้งานจริง

## ภาพรวมระบบ

```text
ผู้ใช้
  ↓ กรอกฟอร์ม / กดปุ่ม
React pages & components (webgames_react/src)
  ↓ เรียกฟังก์ชัน
api/backend.js — fetch JSON, แนบ Bearer token, แปลง error
  ↓ /api/*
Go HTTP server (webgames_golang/main.go)
  ↓ middleware → handler → store
PostgreSQL (webgames_db/schema.sql)
  ↑ ผล query / ผลการเขียนข้อมูล
JSON response → React state → หน้าเว็บ
```

### แหล่งข้อมูลหลัก

- **ข้อมูลเกมและจำนวนคีย์:** อ่านจาก Go API และ PostgreSQL ไม่ได้อ่านจาก `localStorage` เป็นข้อมูลจริงของร้านค้า
- **บัญชีและคำสั่งซื้อ:** PostgreSQL; token สำหรับยืนยันตัวตนเป็น JWT ที่ Go ออกให้
- **สถานะเข้าสู่ระบบในเบราว์เซอร์:** React Context และ `localStorage` เก็บ token/member เพื่อคงสถานะเมื่อ reload
- **คีย์ที่ซื้อแล้ว:** Go ผูกคีย์กับคำสั่งซื้อและส่งกลับใน response/ประวัติคำสั่งซื้อ

## เส้นทางข้อมูลหลัก (Input → API → Output)

| งาน | รับข้อมูลจากผู้ใช้/หน้าเว็บ | API และ Backend | ผลลัพธ์ที่เห็น |
|---|---|---|---|
| ดู/ค้นหาเกม | คำค้น `q`, แนวเกม `genre` | `GET /api/games?q=...&genre=...` → `handler.Games` → `store.GetGames` อ่าน `games` และนับ `game_keys` ที่ยังไม่ถูกขาย | `{ items: [...] }`; `Home` แสดงการ์ดเกมและจำนวนคีย์ |
| ดูเกมรายตัว | `id` จาก URL `/game/:id` | `GET /api/games/{id}` → `handler.Game` → `store.GetGame` | JSON ของเกมรวม `availableKeys`; `GameDetail` แสดงรายละเอียด/ราคา/จำนวนคีย์ |
| สมัครสมาชิก | `displayName`, `email`, `password` | `POST /api/auth/register` → ตรวจข้อมูล → bcrypt hash → บันทึก `users` | `201` พร้อมข้อมูลสมาชิกที่ไม่เปิดเผย password hash; หน้า Register แสดงข้อผิดพลาดหรือไปหน้าแรกหลังขั้น login ต่อ |
| เข้าสู่ระบบ | `email`, `password` | `POST /api/auth/login` → อ่าน user → ตรวจ bcrypt → ออก JWT | `{ token, member }`; AuthContext เก็บ session ใน state และ `localStorage` |
| ซื้อเกม | `gameId`, `quantity` และ Bearer token | `POST /api/game-orders` → ตรวจ login → ทำ transaction: ล็อกคีย์ที่ยังว่าง, สร้าง order, ผูกคีย์เข้ากับ order | `201` พร้อม order, ยอดรวม และ keys; Payment พาไป `/orders` เมื่อสำเร็จ |
| ดูประวัติซื้อ | token จาก AuthContext | `GET /api/users/me/game-orders` → อ่านเฉพาะ order ของ user พร้อม keys | `{ items: [...] }`; `OrderHistory` แสดงรายการและปุ่มคัดลอกคีย์ |
| จัดการเกม (admin) | ฟอร์มเกม / id | `POST`, `PUT`, `DELETE /api/admin/games[/{id}]` → ตรวจ admin → handler → store/DB | เกมที่สร้าง/แก้ไข, หรือ `204` เมื่อลบ; ตารางใน AdminGames ปรับตามผล |
| จัดการคลังคีย์ (admin) | game id, รายการ keys หรือ key id | `GET/POST /api/admin/games/{id}/keys`, `DELETE .../{keyId}` | `{ items: [...] }` หรือ `204`; AdminKeys แสดงจำนวน/รายการคีย์ |
| จัดการสมาชิก (admin) | member id และ role ใหม่ | `GET /api/admin/users`, `PUT /api/admin/users/{id}/role` | รายชื่อหรือสมาชิกที่เปลี่ยน role แล้ว; หน้า AdminMembers อัปเดตแถวหลัง server ยืนยัน |
| Dashboard (admin) | token | `GET /api/admin/dashboard` → query สรุป users/games/orders/keys และ order ล่าสุด | สถิติและ `recentOrders`; AdminDashboard แสดง cards/ตาราง |

ข้อผิดพลาด API ของ Go มีรูป `{ "error": { "code": "...", "message": "..." } }` ส่วน `apiFetch` โยน `Error` พร้อม HTTP status เพื่อให้หน้าแสดงข้อความได้

## Frontend — ไฟล์และหน้าที่

### จุดเริ่มต้นและตัวเชื่อม API

| ไฟล์ | หน้าที่ / Input → Output |
|---|---|
| [`webgames_react/src/index.js`](webgames_react/src/index.js) | จุดเริ่ม React; ครอบแอปด้วย `BrowserRouter` และ `AuthProvider` แล้ว render `App` |
| [`webgames_react/src/App.jsx`](webgames_react/src/App.jsx) | กำหนด URL → page: `/`, `/game/:id`, `/login`, `/register`, `/payment`, `/orders`, `/about`, `/admin/*`; route ที่ป้องกันใช้ ProtectedRoute/RequireRole |
| [`webgames_react/src/api/backend.js`](webgames_react/src/api/backend.js) | API client หลักของ GAMEKEY: สร้าง URL, ส่ง JSON, แนบ `Authorization: Bearer ...`, อ่าน JSON/error และส่งข้อมูลกลับให้หน้า |
| [`webgames_react/src/auth/AuthContext.jsx`](webgames_react/src/auth/AuthContext.jsx) | รับผล login/register จาก API, ตรวจรูป session, เก็บ/ลบ token กับ member ใน `localStorage`; แจก `login`, `logout`, `isAdmin` ฯลฯ ผ่าน `useAuth()` |
| [`webgames_react/src/index.css`](webgames_react/src/index.css) | Tailwind directives และรูปแบบพื้นฐานร่วมของหน้าเว็บ; ไม่เรียก API |

#### ฟังก์ชัน API ใน `src/api/backend.js`

| กลุ่ม | ฟังก์ชัน | Endpoint / ผลลัพธ์ |
|---|---|---|
| สมาชิก | `register`, `login`, `getMe` | `/api/auth/register`, `/api/auth/login`, `/api/users/me` |
| Dashboard/สมาชิก admin | `getAdminStats`, `getAdminMembers`, `setMemberRole` | `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/users/{id}/role` |
| เกม | `getGames`, `getGame`, `createGame`, `updateGame`, `deleteGame` | `/api/games`, `/api/games/{id}`, `/api/admin/games...` |
| คีย์ | `getGameKeys`, `addGameKeys`, `deleteGameKey` | `/api/admin/games/{id}/keys...` |
| คำสั่งซื้อ | `buyGame`, `getGameOrders`, `getAdminGameOrders` | `/api/game-orders`, `/api/users/me/game-orders`, `/api/admin/game-orders` |

`REACT_APP_API_URL` ใช้กำหนด base URL ใน production; ถ้าไม่กำหนดใช้ path เดิมของเว็บ โดย CRA proxy ใน `package.json` ส่ง `/api` ไป `http://localhost:8080`

### Pages ที่อยู่ในเส้นทางใช้งานปัจจุบัน

| ไฟล์ | รับข้อมูล → API/การประมวลผล → Output |
|---|---|
| [`src/pages/Home.jsx`](webgames_react/src/pages/Home.jsx) | โหลดเกมด้วย `getGames()` → เก็บใน state → กรองชื่อ/แนวใน browser → ส่งให้ carousel/grid |
| [`src/pages/GameDetail.jsx`](webgames_react/src/pages/GameDetail.jsx) | รับ `id` จาก route → `getGame(id)` → แสดงข้อมูลเกม; เลือกจำนวนและส่ง checkout state ไป Payment |
| [`src/pages/Login.jsx`](webgames_react/src/pages/Login.jsx) | รับ email/password → `useAuth().login()` → กลับไปหน้าที่ผู้ใช้ตั้งใจเข้า หรือแสดง error; Guest เข้าได้โดยไม่เรียก API |
| [`src/pages/Register.jsx`](webgames_react/src/pages/Register.jsx) | รับชื่อ/email/password/ยืนยันรหัสผ่าน → ตรวจรูปแบบหน้าเว็บ → AuthContext เรียก register แล้ว login → ไปหน้าแรก |
| [`src/pages/Payment.jsx`](webgames_react/src/pages/Payment.jsx) | รับ game/quantity/total ผ่าน navigation state → แสดง QR/เวลาจำลอง → กดยืนยันแล้วเรียก `buyGame` → ไป OrderHistory; ไม่มีการเชื่อมผู้ให้บริการชำระเงินจริง |
| [`src/pages/OrderHistory.jsx`](webgames_react/src/pages/OrderHistory.jsx) | token → `getGameOrders` → แสดงประวัติ, status, ยอดเงิน และ keys; คัดลอก key ผ่าน Clipboard API |
| [`src/pages/About.jsx`](webgames_react/src/pages/About.jsx) | อ่าน member จาก AuthContext และแสดงฟอร์มโปรไฟล์; ปุ่มบันทึกเรียก `updateProfile` ซึ่งปัจจุบันโยน error เพราะยังไม่มี API แก้ไขโปรไฟล์ |
| [`src/pages/NotFound.jsx`](webgames_react/src/pages/NotFound.jsx) | ไม่มี input/API; แสดง 404 และลิงก์กลับหน้าแรก |
| [`src/pages/admin/AdminLayout.jsx`](webgames_react/src/pages/admin/AdminLayout.jsx) | โครงเมนูหลังบ้านและ `<Outlet />`; อ่าน member/logout จาก AuthContext |
| [`src/pages/admin/AdminDashboard.jsx`](webgames_react/src/pages/admin/AdminDashboard.jsx) | token → `getAdminStats` → แสดง counts, sales, keys, pending orders และ recent orders |
| [`src/pages/admin/AdminMembers.jsx`](webgames_react/src/pages/admin/AdminMembers.jsx) | token → โหลดสมาชิก; ค้นหาใน browser; ยืนยันก่อนเปลี่ยน role → `setMemberRole` → แทนแถวด้วยผลจาก server |
| [`src/pages/admin/AdminGames.jsx`](webgames_react/src/pages/admin/AdminGames.jsx) | โหลดเกม; รับค่าฟอร์ม → `createGame`/`updateGame`; ยืนยันก่อนลบ → `deleteGame`; ปรับตารางจากผลตอบกลับ |
| [`src/pages/admin/AdminKeys.jsx`](webgames_react/src/pages/admin/AdminKeys.jsx) | โหลดเกมแล้วเลือก game id → โหลด keys → เพิ่มหลายบรรทัด/ลบ key ผ่าน admin API → แสดงรายการคงเหลือ |

### Components และ state ช่วยเหลือ

| ไฟล์ | หน้าที่ |
|---|---|
| [`src/components/Navbar.jsx`](webgames_react/src/components/Navbar.jsx) | แสดงเมนูตามสถานะ login/role; รับ session จาก AuthContext และเรียก logout |
| [`src/components/Footer.jsx`](webgames_react/src/components/Footer.jsx) | แสดง footer และข้อมูลโครงการ; ไม่มี API |
| [`src/components/ProtectedRoute.jsx`](webgames_react/src/components/ProtectedRoute.jsx) | ตรวจ login/role ในฝั่ง UI ก่อนแสดง route; **ไม่แทน** การตรวจ JWT/role ที่ Go |
| [`src/components/RequireRole.jsx`](webgames_react/src/components/RequireRole.jsx) | แสดงหน้า 403 เมื่อ role ใน Context ไม่ตรง |
| [`src/components/GameCard.jsx`](webgames_react/src/components/GameCard.jsx) | รับ game object → แสดงการ์ด → ไปหน้า detail เมื่อกด |
| [`src/components/GameGrid.jsx`](webgames_react/src/components/GameGrid.jsx) | รับรายการ/status/error → แสดง loading, error/retry, empty state หรือ GameCard |
| [`src/components/FeaturedCarousel.jsx`](webgames_react/src/components/FeaturedCarousel.jsx) | รับเกมแนะนำ → แบ่งหน้าใน client → แสดง GameCard |
| [`src/components/admin/AdminStates.jsx`](webgames_react/src/components/admin/AdminStates.jsx) | UI ใช้ซ้ำสำหรับ ErrorBox, Loading, ConfirmBox และ class ของปุ่ม/ฟอร์ม |

## Backend — ไฟล์และหน้าที่

### Startup, routing และ middleware

| ไฟล์ | รับข้อมูล → ประมวลผล → Output |
|---|---|
| [`webgames_golang/main.go`](webgames_golang/main.go) | อ่าน `JWT_SECRET`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `PORT` → เชื่อม PostgreSQL/สร้าง Handler และ route table → เริ่ม HTTP server (default port 8080) ครอบด้วย Logging/CORS |
| [`handler/handler.go`](webgames_golang/handler/handler.go) | โครง Handler ที่ถือ Store/Tickets; helper เขียน JSON/error, แปลง path id, โหลดข้อมูล `/api/users/me` |
| [`mw/auth.go`](webgames_golang/mw/auth.go) | รับ Authorization Bearer → ตรวจ JWT → ใส่ user id/role ลง request context; ปฏิเสธด้วย 401/403 ก่อนเข้า handler |
| [`mw/cors.go`](webgames_golang/mw/cors.go) | รับ origin และ allow-list จาก config → เพิ่ม CORS headers; ตอบ preflight OPTIONS |
| [`mw/logging.go`](webgames_golang/mw/logging.go) | ครอบ response เพื่อ log method/path/status/duration โดยไม่ log token |

### Handler — รับ HTTP request และสร้าง HTTP response

| ไฟล์ | หน้าที่ |
|---|---|
| [`handler/auth.go`](webgames_golang/handler/auth.go) | decode register/login JSON → validate email/password/display name → เรียก auth/store → คืน member หรือ token/member; hash ไม่ถูกส่งออก |
| [`handler/games.go`](webgames_golang/handler/games.go) | รับ query เกม/ข้อมูลเกม, CRUD เกม admin, จัดการ keys และซื้อเกม; ตรวจ input/แปลง store errors เป็น HTTP status/error JSON |
| [`handler/orders.go`](webgames_golang/handler/orders.go) | อ่าน user id จาก context → ขอประวัติ order ของสมาชิกหรือทั้งหมดสำหรับ admin → คืน `{ items: [...] }` |
| [`handler/admin.go`](webgames_golang/handler/admin.go) | คืนรายชื่อสมาชิก, เปลี่ยน role (ห้ามเปลี่ยนตัวเอง), และสถิติ dashboard |

### Auth และ Store

| ไฟล์ | หน้าที่ |
|---|---|
| [`auth/password.go`](webgames_golang/auth/password.go) | bcrypt hash/compare รหัสผ่าน; รับ plain password แล้วเก็บ/เทียบ hash |
| [`auth/token.go`](webgames_golang/auth/token.go) | ออก/ตรวจ JWT HS256; claims มี subject (user id), role และเวลาหมดอายุ |
| [`store/store.go`](webgames_golang/store/store.go) | ประกาศ Store ที่ถือ PostgreSQL connection pool และ error กลาง |
| [`store/users.go`](webgames_golang/store/users.go) | SQL สร้าง/ค้น/list user และเปลี่ยน role; field password hash ถูกตัดออกจาก JSON |
| [`store/games.go`](webgames_golang/store/games.go) | SQL อ่าน/ค้น/เขียน games และ game_keys; การซื้อเกมอยู่ใน transaction ล็อกคีย์ที่ว่างเพื่อป้องกันขายซ้ำ |
| [`store/orders.go`](webgames_golang/store/orders.go) | query order พร้อมข้อมูลเกมและ key codes; filter ตาม user หรือคืนทั้งหมดให้ admin |
| [`store/admin.go`](webgames_golang/store/admin.go) | รวม query สถิติ dashboard และจำกัดรายการ order ล่าสุดไม่เกิน 5 |

### Database และสัญญา API

| ไฟล์ | หน้าที่ |
|---|---|
| [`webgames_db/schema.sql`](webgames_db/schema.sql) | นิยาม users, games, game_orders, game_keys และ constraint/index; ยังมีตาราง coupon รุ่นเดิมซึ่ง Go storefront ปัจจุบันไม่ได้เรียก |
| [`webgames_db/seed.sql`](webgames_db/seed.sql) | เติมข้อมูล catalog เกมตัวอย่าง ไม่ได้สร้างบัญชี admin หรือ CD-Key จริง |
| [`webgames_db/gamekeycd_dump.sql`](webgames_db/gamekeycd_dump.sql) | SQL dump/สคริปต์รวมสำหรับฐานข้อมูล |
| [`webgames_db/docker-compose.yml`](webgames_db/docker-compose.yml) | ตั้ง PostgreSQL สำหรับพัฒนาในเครื่อง |
| [`webgames_db/Test.sql`](webgames_db/Test.sql) | query ตรวจ catalog, key คงเหลือ และประวัติคำสั่งซื้อ |
| [`webgames_db/README_DB.md`](webgames_db/README_DB.md), [`webgames_golang/Test.md`](webgames_golang/Test.md) | วิธีตั้ง DB/API และสรุป routes ของ GAMEKEY |

## API Contract ของ Go ที่ Frontend ปัจจุบันเรียก

| Method | Path | สิทธิ์ | Input → Success output |
|---|---|---|---|
| `POST` | `/api/auth/register` | Guest | `{email,password,displayName}` → `201` member |
| `POST` | `/api/auth/login` | Guest | `{email,password}` → `{token,member}` |
| `GET` | `/api/users/me` | Login | Bearer token → member |
| `GET` | `/api/games` | Public | query `q`, `genre` → `{items:[game]}` |
| `GET` | `/api/games/{id}` | Public | path id → game และ `availableKeys` |
| `POST` | `/api/game-orders` | Login | `{gameId,quantity}` → `201` order และ keys |
| `GET` | `/api/users/me/game-orders` | Login | token → `{items:[order]}` เฉพาะสมาชิกนั้น |
| `GET` | `/api/admin/dashboard` | Admin | token → counts, sales, recent orders |
| `GET` | `/api/admin/game-orders` | Admin | token → `{items:[order]}` ทั้งหมด |
| `GET` | `/api/admin/users` | Admin | token → `{items:[member]}` |
| `PUT` | `/api/admin/users/{id}/role` | Admin | `{role:"member"|"admin"}` → member ที่แก้แล้ว |
| `POST` | `/api/admin/games` | Admin | fields เกม → `201` game |
| `PUT` | `/api/admin/games/{id}` | Admin | fields เกม → game ที่แก้แล้ว |
| `DELETE` | `/api/admin/games/{id}` | Admin | path id → `204`; conflict หากมีประวัติซื้อ |
| `GET` | `/api/admin/games/{id}/keys` | Admin | path id → `{items:[key]}` |
| `POST` | `/api/admin/games/{id}/keys` | Admin | `{keys:[string]}` → `201 {items:[key]}` |
| `DELETE` | `/api/admin/games/{id}/keys/{keyId}` | Admin | path ids → `204` |

## ไฟล์ทดสอบ/เครื่องมือ Go

- [`handler/auth_test.go`](webgames_golang/handler/auth_test.go), [`auth/token_test.go`](webgames_golang/auth/token_test.go): ทดสอบ validation password และการตรวจ JWT
- [`webgames_golang/api_test.go`](webgames_golang/api_test.go): integration test รุ่นเก่าที่เรียก `/api/coupons` และ `/api/admin/stats` ซึ่งไม่ใช่ routes ใน `main.go` ปัจจุบัน; ไม่ควรใช้เป็นหลักฐานว่า GAMEKEY API ทุก endpoint ผ่าน
- [`cmd/hashlab/main.go`](webgames_golang/cmd/hashlab/main.go): ทดลอง bcrypt hash/compare และต้นทุนการคำนวณ
- [`cmd/peek/main.go`](webgames_golang/cmd/peek/main.go): เครื่องมือดูเนื้อหา JWT แบบ base64; ไม่ตรวจลายเซ็นและไม่ใช้ใน server runtime
- [`webgames_golang/go.mod`](webgames_golang/go.mod), [`go.sum`](webgames_golang/go.sum): Go module dependencies/checksum

## หมายเหตุการรันในเครื่อง

1. ใช้ [`webgames_db/README_DB.md`](webgames_db/README_DB.md) เพื่อเริ่ม PostgreSQL และโหลด schema/seed
2. เริ่ม Go API โดยกำหนด `DATABASE_URL`, `JWT_SECRET` (อย่างน้อย 32 ตัวอักษร), `ALLOWED_ORIGINS` (เช่น origin ของ React) และเลือก `PORT` ได้
3. ใน `webgames_react/` รัน `npm start`; proxy ส่ง `/api` ไป Go ที่ port 8080
4. เพิ่ม CD-Key ที่ใช้งานได้ผ่านหน้า Admin ก่อนซื้อ เพราะ seed เติมเฉพาะเกม



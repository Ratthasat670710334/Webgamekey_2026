curl -s 'localhost:8080/api/webgames_key?q=rov'

curl -s -w '%{http_code}\n' localhost:8080/api/webgames_key/4/Orders




curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"Username":"Test00001" ,"password":"Test01234567890","email":"test01@example.com"}'
curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"Username":"Test00002" ,"password":"Test01234567890","email":"test02@example.com"}'



curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test01@example.com","password":"Test01234567890"}'
curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test02@example.com","password":"Test01234567890"}'


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DELETE FROM users WHERE user_id =9;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DELETE FROM coupon_packages WHERE package_id =0;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM coupon_packages;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM orders;" 
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM coupon_codes;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DROP TABLE orders;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    code_id INT NOT NULL UNIQUE REFERENCES coupon_codes(code_id), -- UNIQUE เพื่อป้องกันการขายโค้ดซ้ำ
    purchase_price NUMERIC(10, 2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);"





export TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJzdWIiOiI2IiwiZXhwIjoxNzk0MDcxMzk1LCJpYXQiOjE3OTQwNjc3OTV9.D6hw47aC0aiK8U8NqKfQ6AA9Ogomf_plqfflpysMDy0

cd webgames_db
docker compose up -d
sudo apt-get update && sudo apt-get install -y postgresql-client


cd webgames_golang
export DATABASE_URL="postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db"
export JWT_SECRET=$(cat .jwt_secret)
export ALLOWED_ORIGINS=http://localhost:3000
go run .




curl -i -X POST 'http://localhost:8080/api/coupons/1/buy' \
  -H "Authorization: Bearer $TOKEN"


  curl -i -X GET 'http://localhost:8080/api/admin/users' \
  -H "Authorization: Bearer $TOKEN"



  curl -s -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" localhost:8080/api/admin/users
  curl -s -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" localhost:8080/api/admin/coupons/jew/deletecoupons


  curl -i -X GET 'http://localhost:8080/api/admin/coupons/jew/deletecoupons' \
  -H "Authorization: Bearer $TOKEN"


  curl -i -X GET 'http://localhost:8080/api/webgames_key' \
  -H "Authorization: Bearer $TOKEN"


  psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "UPDATE users SET role = 'admin' WHERE email = 'test01@example.com';"








curl -i -X GET 'http://localhost:8080/api/coupons' 
curl -i -X GET 'http://localhost:8080/api/coupons/search?q=100' 



curl -i -X GET 'http://localhost:8080/api/coupons/1' 
curl -i -X GET 'http://localhost:8080/api/coupons/aaa' 
curl -i -X GET 'http://localhost:8080/api/coupons/3' 






curl -i -X POST 'http://localhost:8080/api/coupons/2/buy' \
  -H "Authorization: Bearer $TOKEN"


curl -i -X GET 'http://localhost:8080/api/users/me/orders' \
-H "Authorization: Bearer $TOKEN"



--แอดมินดูรวมทั้งหมด

curl -i -X GET 'http://localhost:8080/api/admin/stats' \
-H "Authorization: Bearer $TOKEN"

curl -i -X GET 'http://localhost:8080/api/admin/users' \
-H "Authorization: Bearer $TOKEN"

curl -i -X GET 'http://localhost:8080/api/admin/orders' \
-H "Authorization: Bearer $TOKEN"




--แอดมินดูคูปอง
curl -i -X GET 'http://localhost:8080/api/admin/coupons/1' \
-H "Authorization: Bearer $TOKEN"
curl -i -X GET 'http://localhost:8080/api/admin/coupons/AAA' \
-H "Authorization: Bearer $TOKEN"
curl -i -X GET 'http://localhost:8080/api/admin/coupons/3' \
-H "Authorization: Bearer $TOKEN"






เพิ่มคูปอง
curl -s -w '%{http_code}\n' -X POST localhost:8080/api/admin/coupons -H "Authorization: Bearer $TOKEN"  -H 'Content-Type: application/json' -d '{"package_id":3,"game_name":"GameTest1","title":"ทดสอบ1","description":"ทดสอบคูปอง","price":500,"max_per_user":3,"is_active":true}' 

แก้คูปอง
curl -s -w '%{http_code}\n' -X PUT localhost:8080/api/admin/coupons/3 -H "Authorization: Bearer $TOKEN"  -H 'Content-Type: application/json' -d '{"game_name":"GameTest1111","title":"ทดสอบ111","description":"ทดสอบคูปอง","price":500,"max_per_user":3,"is_active":true}'



--แอดมินลบ

curl -i -X DELETE 'http://localhost:8080/api/admin/coupons/3' \
-H "Authorization: Bearer $TOKEN"
curl -i -X DELETE 'http://localhost:8080/api/admin/coupons/AAA' \
-H "Authorization: Bearer $TOKEN"
curl -i -X DELETE 'http://localhost:8080/api/admin/coupons/9999' \
-H "Authorization: Bearer $TOKEN"


















API_BASE_URL=http://localhost:8080 API_ADMIN_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJzdWIiOiI2IiwiZXhwIjoxNzk0MDY5MDE2LCJpYXQiOjE3OTQwNjU0MTZ9.8TFRr3I8cp4HARwccRPx2LrvNOkyE-sjz3O0s0_kbjE' go test -run TestAPIAllRoutes
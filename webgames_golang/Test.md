curl -s 'localhost:8080/api/webgames_key?q=rov'

curl -s -w '%{http_code}\n' localhost:8080/api/webgames_key/4/Orders




curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"Username":"Test00001" ,"password":"Test01234567890","email":"test01@example.com"}'
curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"Username":"Test00002" ,"password":"Test01234567890","email":"test02@example.com"}'



curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test01@example.com","password":"Test01234567890"}'
curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test02@example.com","password":"Test01234567890"}'


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DELETE FROM users WHERE user_id =9;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM coupon_packages;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM orders;"



export TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIxMiIsImV4cCI6MTc5Mzk5MTE5NCwiaWF0IjoxNzkzOTg3NTk0fQ.T6NnD0Py6Av4_AI-4L8d8WaYPFahsKw1A9MMBmgYGGY



docker compose up -d
sudo apt-get update && sudo apt-get install -y postgresql-client

export DATABASE_URL="postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db"
export JWT_SECRET=$(cat .jwt_secret)
export ALLOWED_ORIGINS=http://localhost:3000
go run .




curl -i -X POST 'http://localhost:8080/api/coupons/1/buy' \
  -H "Authorization: Bearer $TOKEN"


  curl -i -X GET 'http://localhost:8080/api/admin/members' \
  -H "Authorization: Bearer $TOKEN"



  curl -s -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" localhost:8080/api/admin/users
  curl -s -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" localhost:8080/api/admin/coupons/jew/deletecoupons


  curl -i -X GET 'http://localhost:8080/api/admin/coupons/jew/deletecoupons' \
  -H "Authorization: Bearer $TOKEN"


  curl -i -X GET 'http://localhost:8080/api/webgames_key' \
  -H "Authorization: Bearer $TOKEN"


  psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "UPDATE users SET role = 'admin' WHERE email = 'test01@example.com';"








curl -i -X GET 'http://localhost:8080/api/coupons' \
-H "Authorization: Bearer $TOKEN"

curl -i -X GET 'http://localhost:8080/api/coupons/1' \
-H "Authorization: Bearer $TOKEN"

curl -i -X GET 'http://localhost:8080/api/users/me/11/orders' \
-H "Authorization: Bearer $TOKEN"



curl -i -X GET 'http://localhost:8080/api/admin/users' \
-H "Authorization: Bearer $TOKEN"

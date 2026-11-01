curl -s 'localhost:8080/api/webgames_key?q=rov'

curl -s -w '%{http_code}\n' localhost:8080/api/webgames_key/abc/Orders




curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/register -H 'Content-Type: application/json' -d '{"Username":"Test00001" ,"password":"Test01234567890","email":"test01@example.com"}'


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DELETE FROM users WHERE user_id =9;"



curl -s -w '%{http_code}\n' -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' -d '{"email":"test01@example.com","password":"Test01234567890"}'



export TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiY3VzdG9tZXIiLCJzdWIiOiIxMSIsImV4cCI6MTc5MzUxNDM2MiwiaWF0IjoxNzkzNTEwNzYyfQ.oA8LRUtaAsQYkVVdBvA-Sj_Xiy5i_Osp-S55jinHy2A


export DATABASE_URL="postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db"
export JWT_SECRET=$(cat .jwt_secret)
go run .
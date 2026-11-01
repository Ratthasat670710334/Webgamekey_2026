
-วิธีทดสอบ

-1

docker compose up -d

-2 ติดตั้ง
sudo apt-get update && sudo apt-get install -y postgresql-client

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/postgres" -c "CREATE DATABASE webgames_db"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -f schema.sql
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -f seed.sql

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c ""


export DATABASE_URL="postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db"
export JWT_SECRET=$(cat .jwt_secret)
go run .




psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT package_id ,game_name, title, description ,price, max_per_user
FROM coupon_packages
WHERE is_active = TRUE;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"

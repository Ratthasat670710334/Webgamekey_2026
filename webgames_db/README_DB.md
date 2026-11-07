
-วิธีทดสอบ

-1

docker compose up -d
sudo apt-get update && sudo apt-get install -y postgresql-client


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/postgres" -c "CREATE DATABASE webgames_db"



psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DROP TABLE orders;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DROP TABLE coupon_codes;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DROP TABLE users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "DROP TABLE coupon_packages;"

psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -f schema.sql
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -f seed.sql


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM coupon_packages;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM orders;" 
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM coupon_codes;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "INSERT INTO coupon_codes (package_id, coupon_code, status) VALUES
(2, 'VALO-XXXX-9998', 'available'),
(2, 'VALO-XXXX-9997', 'available'),
(2, 'VALO-XXXX-9996', 'available'),
(2, 'VALO-XXXX-9995', 'available')
;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "INSERT INTO coupon_codes (package_id, coupon_code, status) VALUES
(2, 'VALO-XXXX-9994', 'available')
;"







psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c ""


export DATABASE_URL="postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db"
export JWT_SECRET=$(cat .jwt_secret)
go run .




psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT package_id ,game_name, title, description ,price, max_per_user
FROM coupon_packages
WHERE is_active = TRUE;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT * FROM users;"



//-- คำสั่ง
psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "
        
        WITH orders_price AS (
		SELECT cp.package_id, cp.title ,cp.price FROM orders o
        JOIN coupon_codes cc ON cc.code_id = o.code_id
		JOIN coupon_packages cp ON cc.package_id = cp.package_id
		)
				
		
        SELECT package_id ,title ,SUM(price),AVG(price) FROM orders_price 
        GROUP BY package_id ,title ,price
        ORDER BY price DESC
        LIMIT 5

        ;"

SELECT o.order_id ,
    o.user_id ,
    u.username,
    o.code_id , 
    cp.game_name,
    cp.title,
    o.purchase_price ,
    o.purchased_at
FROM orders o
JOIN users u ON u.user_id = o.user_id 
JOIN coupon_codes cc ON cc.code_id =o.code_id 
JOIN  coupon_packages cp ON cp.package_id = cc.package_id
WHERE o.order_id = 1 ;


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "SELECT o.order_id ,
    o.user_id ,
    u.username,
    o.code_id , 
    cp.game_name,
    cp.title,
    o.purchase_price ,
    o.purchased_at
FROM orders o
JOIN users u ON u.user_id = o.user_id 
JOIN coupon_codes cc ON cc.code_id =o.code_id 
JOIN  coupon_packages cp ON cp.package_id = cc.package_id
WHERE o.order_id = 1 ;"

--WHERE o.order_id = $1



psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "
SELECT package_id ,game_name, title, description ,price, max_per_user
			FROM coupon_packages
			WHERE lower(game_name) LIKE 'rov' ;"


psql "postgres://postgres:pg_670710334@127.0.0.1:5432/webgames_db" -c "
SELECT *
			FROM orders;"
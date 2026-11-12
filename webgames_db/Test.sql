-- Storefront catalog and inventory checks
SELECT id, title, genre, price, discount_price, discount, platform, region, status
FROM games
ORDER BY id;

SELECT g.id, g.title, COUNT(k.key_id) FILTER (WHERE k.order_id IS NULL) AS available_keys
FROM games g
LEFT JOIN game_keys k ON k.game_id = g.id
GROUP BY g.id
ORDER BY g.id;

SELECT o.order_id, u.username, g.title, o.quantity, o.total_price, o.purchased_at
FROM game_orders o
JOIN users u ON u.user_id = o.user_id
JOIN games g ON g.id = o.game_id
ORDER BY o.purchased_at DESC;

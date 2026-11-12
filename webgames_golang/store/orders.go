package store

import (
	"context"
	"fmt"
	"time"
)

type GameOrder struct {
	OrderID    string    `json:"orderId"`
	GameID     int64     `json:"gameId"`
	Title      string    `json:"title"`
	Poster     string    `json:"poster"`
	Platform   string    `json:"platform"`
	Region     string    `json:"region"`
	Quantity   int       `json:"quantity"`
	TotalPrice float64   `json:"totalPrice"`
	Date       time.Time `json:"date"`
	Status     string    `json:"status"`
	Keys       []string  `json:"keys"`
}

func (s *Store) getGameOrders(ctx context.Context, userID int64) ([]GameOrder, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT o.order_id, o.game_id, g.title, g.poster, g.platform, g.region,
			o.quantity, o.total_price, o.purchased_at, o.status,
			COALESCE(array_agg(k.key_code ORDER BY k.key_id) FILTER (WHERE k.key_id IS NOT NULL), ARRAY[]::text[])
		FROM game_orders o JOIN games g ON g.id=o.game_id
		LEFT JOIN game_keys k ON k.order_id=o.order_id
		WHERE ($1=0 OR o.user_id=$1)
		GROUP BY o.order_id, g.id ORDER BY o.purchased_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GameOrder{}
	for rows.Next() {
		var item GameOrder
		var id int64
		if err := rows.Scan(&id, &item.GameID, &item.Title, &item.Poster, &item.Platform, &item.Region,
			&item.Quantity, &item.TotalPrice, &item.Date, &item.Status, &item.Keys); err != nil {
			return nil, err
		}
		item.OrderID = fmt.Sprintf("GK%d", id)
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) GameOrders(ctx context.Context, userID int64) ([]GameOrder, error) {
	return s.getGameOrders(ctx, userID)
}

func (s *Store) AdminGameOrders(ctx context.Context) ([]GameOrder, error) {
	return s.getGameOrders(ctx, 0)
}

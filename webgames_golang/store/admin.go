package store

import (
	"context"
)

func (s *Store) GameDashboardStats(ctx context.Context) (GameStats, error) {
	var stats GameStats
	err := s.Pool.QueryRow(ctx, `
		SELECT (SELECT count(*) FROM games),
			(SELECT count(*) FROM users),
			(SELECT count(*) FROM game_orders),
			COALESCE((SELECT sum(total_price) FROM game_orders), 0),
			(SELECT count(*) FROM game_keys WHERE order_id IS NULL),
			(SELECT count(*) FROM game_orders WHERE status <> 'ชำระเงินสำเร็จ')`).Scan(
		&stats.GameCount, &stats.MemberCount, &stats.OrderCount, &stats.Sales,
		&stats.AvailableKeys, &stats.PendingOrders)
	if err != nil {
		return stats, err
	}
	orders, err := s.getGameOrders(ctx, 0)
	if err != nil {
		return stats, err
	}
	if len(orders) > 5 {
		orders = orders[:5]
	}
	stats.RecentOrders = orders
	return stats, nil
}

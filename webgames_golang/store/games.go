package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Game struct {
	ID            int64   `json:"id"`
	Title         string  `json:"title"`
	Genre         string  `json:"genre"`
	Price         float64 `json:"price"`
	DiscountPrice float64 `json:"discountPrice"`
	Discount      int     `json:"discount"`
	Rating        float64 `json:"rating"`
	Platform      string  `json:"platform"`
	Region        string  `json:"region"`
	Poster        string  `json:"poster"`
	Detail        string  `json:"detail"`
	Status        string  `json:"status"`
	AvailableKeys int     `json:"availableKeys"`
}

type GameInput struct {
	ID            int64   `json:"id"`
	Title         string  `json:"title"`
	Genre         string  `json:"genre"`
	Price         float64 `json:"price"`
	DiscountPrice float64 `json:"discountPrice"`
	Discount      int     `json:"discount"`
	Rating        float64 `json:"rating"`
	Platform      string  `json:"platform"`
	Region        string  `json:"region"`
	Poster        string  `json:"poster"`
	Detail        string  `json:"detail"`
	Status        string  `json:"status"`
}

type GameKey struct {
	ID        int64     `json:"id"`
	GameID    int64     `json:"gameId"`
	Key       string    `json:"key"`
	CreatedAt time.Time `json:"createdAt"`
}

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

type GameStats struct {
	GameCount     int64       `json:"gameCount"`
	MemberCount   int64       `json:"memberCount"`
	OrderCount    int64       `json:"orderCount"`
	Sales         float64     `json:"sales"`
	AvailableKeys int64       `json:"availableKeys"`
	PendingOrders int64       `json:"pendingOrders"`
	RecentOrders  []GameOrder `json:"recentOrders"`
}

var (
	ErrGameNotFound     = errors.New("game not found")
	ErrGameInUse        = errors.New("game has completed orders")
	ErrDuplicateGame    = errors.New("duplicate game id")
	ErrInsufficientKeys = errors.New("not enough game keys")
	ErrDuplicateGameKey = errors.New("duplicate game key")
	ErrGameKeyNotFound  = errors.New("game key not found")
)

const gameColumns = `g.id, g.title, g.genre, g.price, g.discount_price, g.discount,
	g.rating, g.platform, g.region, g.poster, g.detail, g.status`

func (s *Store) GetGames(ctx context.Context, query, genre string) ([]Game, error) {
	rows, err := s.Pool.Query(ctx, `
		SELECT `+gameColumns+`, count(k.key_id)
		FROM games g
		LEFT JOIN game_keys k ON k.game_id = g.id AND k.order_id IS NULL
		WHERE ($1 = '' OR g.title ILIKE '%' || $1 || '%' OR g.genre ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR g.genre = $2)
		GROUP BY g.id
		ORDER BY g.id`, query, genre)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Game{}
	for rows.Next() {
		var game Game
		if err := scanGame(rows, &game); err != nil {
			return nil, err
		}
		items = append(items, game)
	}
	return items, rows.Err()
}

func (s *Store) GetGame(ctx context.Context, id int64) (Game, error) {
	var game Game
	err := scanGame(s.Pool.QueryRow(ctx, `
		SELECT `+gameColumns+`, count(k.key_id)
		FROM games g
		LEFT JOIN game_keys k ON k.game_id = g.id AND k.order_id IS NULL
		WHERE g.id = $1
		GROUP BY g.id`, id), &game)
	if errors.Is(err, pgx.ErrNoRows) {
		return Game{}, ErrGameNotFound
	}
	return game, err
}

func scanGame(row interface{ Scan(...any) error }, game *Game) error {
	return row.Scan(&game.ID, &game.Title, &game.Genre, &game.Price, &game.DiscountPrice,
		&game.Discount, &game.Rating, &game.Platform, &game.Region, &game.Poster,
		&game.Detail, &game.Status, &game.AvailableKeys)
}

func (s *Store) CreateGame(ctx context.Context, in GameInput) (Game, error) {
	var id int64
	if in.ID > 0 {
		err := s.Pool.QueryRow(ctx, `
			INSERT INTO games (id, title, genre, price, discount_price, discount, rating, platform, region, poster, detail, status)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
			in.ID, in.Title, in.Genre, in.Price, in.DiscountPrice, in.Discount, in.Rating,
			in.Platform, in.Region, in.Poster, in.Detail, in.Status).Scan(&id)
		if err != nil {
			if isUniqueViolation(err) {
				return Game{}, ErrDuplicateGame
			}
			return Game{}, err
		}
	} else {
		err := s.Pool.QueryRow(ctx, `
			INSERT INTO games (title, genre, price, discount_price, discount, rating, platform, region, poster, detail, status)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
			in.Title, in.Genre, in.Price, in.DiscountPrice, in.Discount, in.Rating,
			in.Platform, in.Region, in.Poster, in.Detail, in.Status).Scan(&id)
		if err != nil {
			if isUniqueViolation(err) {
				return Game{}, ErrDuplicateGame
			}
			return Game{}, err
		}
	}
	return s.GetGame(ctx, id)
}

func (s *Store) UpdateGame(ctx context.Context, id int64, in GameInput) (Game, error) {
	tag, err := s.Pool.Exec(ctx, `
		UPDATE games SET title=$2, genre=$3, price=$4, discount_price=$5, discount=$6, rating=$7,
			platform=$8, region=$9, poster=$10, detail=$11, status=$12, updated_at=CURRENT_TIMESTAMP
		WHERE id=$1`,
		id, in.Title, in.Genre, in.Price, in.DiscountPrice, in.Discount, in.Rating,
		in.Platform, in.Region, in.Poster, in.Detail, in.Status)
	if err != nil {
		return Game{}, err
	}
	if tag.RowsAffected() == 0 {
		return Game{}, ErrGameNotFound
	}
	return s.GetGame(ctx, id)
}

func (s *Store) DeleteGame(ctx context.Context, id int64) error {
	tag, err := s.Pool.Exec(ctx, `DELETE FROM games WHERE id=$1`, id)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23503" {
			return ErrGameInUse
		}
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrGameNotFound
	}
	return nil
}

func (s *Store) ListGameKeys(ctx context.Context, gameID int64) ([]GameKey, error) {
	if _, err := s.GetGame(ctx, gameID); err != nil {
		return nil, err
	}
	rows, err := s.Pool.Query(ctx, `
		SELECT key_id, game_id, key_code, created_at
		FROM game_keys WHERE game_id=$1 AND order_id IS NULL ORDER BY key_id`, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GameKey{}
	for rows.Next() {
		var item GameKey
		if err := rows.Scan(&item.ID, &item.GameID, &item.Key, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) AddGameKeys(ctx context.Context, gameID int64, keys []string) ([]GameKey, error) {
	if _, err := s.GetGame(ctx, gameID); err != nil {
		return nil, err
	}
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)
	for _, key := range keys {
		if _, err := tx.Exec(ctx, `INSERT INTO game_keys (game_id, key_code) VALUES ($1,$2)`, gameID, key); err != nil {
			if isUniqueViolation(err) {
				return nil, ErrDuplicateGameKey
			}
			return nil, err
		}
	}
	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return s.ListGameKeys(ctx, gameID)
}

func (s *Store) DeleteGameKey(ctx context.Context, gameID, keyID int64) error {
	tag, err := s.Pool.Exec(ctx, `DELETE FROM game_keys WHERE game_id=$1 AND key_id=$2 AND order_id IS NULL`, gameID, keyID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrGameKeyNotFound
	}
	return nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func (s *Store) BuyGame(ctx context.Context, userID, gameID int64, quantity int) (GameOrder, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return GameOrder{}, err
	}
	defer tx.Rollback(ctx)

	var game Game
	err = scanGame(tx.QueryRow(ctx, `
		SELECT `+gameColumns+`, count(k.key_id)
		FROM games g
		LEFT JOIN game_keys k ON k.game_id=g.id AND k.order_id IS NULL
		WHERE g.id=$1 GROUP BY g.id`, gameID), &game)
	if errors.Is(err, pgx.ErrNoRows) {
		return GameOrder{}, ErrGameNotFound
	}
	if err != nil {
		return GameOrder{}, err
	}

	rows, err := tx.Query(ctx, `
		SELECT key_id, key_code FROM game_keys
		WHERE game_id=$1 AND order_id IS NULL
		ORDER BY key_id LIMIT $2 FOR UPDATE SKIP LOCKED`, gameID, quantity)
	if err != nil {
		return GameOrder{}, err
	}
	type pickedKey struct {
		id   int64
		code string
	}
	picked := []pickedKey{}
	for rows.Next() {
		var key pickedKey
		if err := rows.Scan(&key.id, &key.code); err != nil {
			rows.Close()
			return GameOrder{}, err
		}
		picked = append(picked, key)
	}
	err = rows.Err()
	rows.Close()
	if err != nil {
		return GameOrder{}, err
	}
	if len(picked) != quantity {
		return GameOrder{}, ErrInsufficientKeys
	}

	total := game.DiscountPrice * float64(quantity)
	var orderID int64
	err = tx.QueryRow(ctx, `
		INSERT INTO game_orders (user_id, game_id, quantity, total_price)
		VALUES ($1,$2,$3,$4) RETURNING order_id`, userID, gameID, quantity, total).Scan(&orderID)
	if err != nil {
		return GameOrder{}, err
	}
	codes := make([]string, 0, quantity)
	for _, key := range picked {
		if _, err := tx.Exec(ctx, `
			UPDATE game_keys SET order_id=$1, sold_at=CURRENT_TIMESTAMP
			WHERE key_id=$2`, orderID, key.id); err != nil {
			return GameOrder{}, err
		}
		codes = append(codes, key.code)
	}
	if err := tx.Commit(ctx); err != nil {
		return GameOrder{}, err
	}
	return GameOrder{
		OrderID: fmt.Sprintf("GK%d", orderID), GameID: game.ID, Title: game.Title,
		Poster: game.Poster, Platform: game.Platform, Region: game.Region,
		Quantity: quantity, TotalPrice: total, Date: time.Now().UTC(),
		Status: "ชำระเงินสำเร็จ", Keys: codes,
	}, nil
}

func (s *Store) GameOrders(ctx context.Context, userID int64) ([]GameOrder, error) {
	return s.getGameOrders(ctx, userID)
}

func (s *Store) AdminGameOrders(ctx context.Context) ([]GameOrder, error) {
	return s.getGameOrders(ctx, 0)
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

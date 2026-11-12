package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	//"errors"
	//"time"
	//"github.com/jackc/pgx/v5"
	//"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrDuplicateID = errors.New("duplicate id")
)

// ---------- Dashboard ----------

type TopCoupon struct {
	ID           int64   `json:"id"`
	Title        string  `json:"title"`
	SellSum      int64   `json:"sellsum"`
	TotalAverage float64 `json:"totalaverage"`
}

type Stats struct {
	Coupons       int64       `json:"coupons"`
	Users         int64       `json:"users"`
	Admins        int64       `json:"admins"`
	Orders        int64       `json:"orders"`
	Totals        float64     `json:"totals"`
	NewestUsers   []User      `json:"newestUsers"`
	TopCouponsell []TopCoupon `json:"topCoupon"`
}

// Stats รวมตัวเลขของทั้งเว็บในคำขอเดียว ให้หน้า Dashboard ยิงครั้งเดียวจบ
func (s *Store) Stats(ctx context.Context) (Stats, error) {
	var st Stats
	err := s.Pool.QueryRow(ctx,
		`
		WITH orders_price AS (
		SELECT o.order_id,cp.price FROM orders o
        JOIN coupon_codes cc ON cc.code_id = o.code_id
		JOIN coupon_packages cp ON cc.package_id = cp.package_id
		)
				
		
		SELECT (SELECT count(*) FROM coupon_packages),
                (SELECT count(*) FROM users),
                (SELECT count(*) FROM users WHERE role = 'admin'),
                (SELECT count(*) FROM orders),
                (SELECT COALESCE(sum(price), 0) FROM orders_price )
				
				`).
		Scan(&st.Coupons, &st.Users, &st.Admins, &st.Orders, &st.Totals)
	if err != nil {
		return st, err
	}

	rows, err := s.Pool.Query(ctx,
		`SELECT user_id, username, email, role, created_at
         FROM users ORDER BY created_at DESC, user_id DESC LIMIT 5`)
	if err != nil {
		return st, err
	}
	st.NewestUsers = []User{}
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.CreatedAt); err != nil {
			rows.Close()
			return st, err
		}
		st.NewestUsers = append(st.NewestUsers, u)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return st, err
	}

	rows, err = s.Pool.Query(ctx,
		`SELECT cp.package_id, cp.title, COUNT(*), AVG(o.purchase_price)
	 FROM orders o
	 JOIN coupon_codes cc ON cc.code_id = o.code_id
	 JOIN coupon_packages cp ON cc.package_id = cp.package_id
	 GROUP BY cp.package_id, cp.title
	 ORDER BY COUNT(*) DESC, cp.title
	 LIMIT 5`)
	if err != nil {
		return st, err
	}
	defer rows.Close()
	st.TopCouponsell = []TopCoupon{}
	for rows.Next() {
		var t TopCoupon
		if err := rows.Scan(&t.ID, &t.Title, &t.SellSum, &t.TotalAverage); err != nil {
			return st, err
		}
		st.TopCouponsell = append(st.TopCouponsell, t)
	}
	return st, rows.Err()
}

type CouponInput struct {
	PackageID   int      `json:"package_id"`
	GameName    *string  `json:"game_name"`
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	MaxPerUser  *int     `json:"max_per_user"`
	IsActive    *bool    `json:"is_active"`
}

type Impact struct {
	Totals int64 `json:"Totals"`
}

type AdminCoupon struct {
	ID int64 `json:"id"`
	CouponInput
	TotalAverage float64   `json:"TotalAverage"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Impact       Impact    `json:"impact"`
}

// AdminGetCoupon อ่านทุกช่องที่ฟอร์มต้องใช้ พร้อมจำนวนข้อมูลที่ผูกกับคูปองเรื่องนี้
func (s *Store) AdminGetCoupon(ctx context.Context, id int64) (AdminCoupon, error) {
	var c AdminCoupon
	err := s.Pool.QueryRow(ctx,
		`SELECT game_name, title, description, price, max_per_user, is_active
		FROM coupon_packages
			WHERE package_id =$1`, id).
		Scan(&c.GameName, &c.Title, &c.Description, &c.Price, &c.MaxPerUser, &c.IsActive)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	c.ID = id
	c.PackageID = int(id)
	return c, err
}

func (s *Store) CreateCoupon(ctx context.Context, id int64, in CouponInput) (AdminCoupon, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return AdminCoupon{}, err
	}
	defer tx.Rollback(ctx) // ถ้า Commit ไปแล้ว Rollback จะไม่มีผล

	packageID := id
	if packageID == 0 && in.PackageID > 0 {
		packageID = int64(in.PackageID)
	}
	if in.MaxPerUser == nil {
		defaultLimit := 1
		in.MaxPerUser = &defaultLimit
	}
	if in.IsActive == nil {
		active := true
		in.IsActive = &active
	}

	var createdID int64
	if packageID > 0 {
		err = tx.QueryRow(ctx,
			`INSERT INTO coupon_packages (package_id, game_name, title, description, price, max_per_user, is_active)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING package_id`,
			packageID, in.GameName, in.Title, in.Description, in.Price,
			in.MaxPerUser, in.IsActive).Scan(&createdID)
	} else {
		err = tx.QueryRow(ctx,
			`INSERT INTO coupon_packages (game_name, title, description, price, max_per_user, is_active)
			 VALUES ($1, $2, $3, $4, $5, $6)
			 RETURNING package_id`,
			in.GameName, in.Title, in.Description, in.Price,
			in.MaxPerUser, in.IsActive).Scan(&createdID)
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return AdminCoupon{}, ErrDuplicateID
	}
	if err != nil {
		return AdminCoupon{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return AdminCoupon{}, err
	}
	return s.AdminGetCoupon(ctx, createdID)
}

// UpdateMovie แก้ช่องที่ admin ดูแล ไม่แตะคะแนน/ความนิยมที่มาจาก TMDB
func (s *Store) UpdateCoupon(ctx context.Context, id int64, in CouponInput) (AdminCoupon, error) {
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return AdminCoupon{}, err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx,
		`UPDATE coupon_packages
         SET game_name = $2, title = $3, description = $4, price = $5,
		 max_per_user = $6, is_active = COALESCE($7, is_active)
         WHERE package_id = $1`,
		id, in.GameName, in.Title, in.Description, in.Price,
		in.MaxPerUser, in.IsActive)
	if err != nil {
		return AdminCoupon{}, err
	}
	if tag.RowsAffected() == 0 {
		return AdminCoupon{}, ErrNotFound
	}
	if err := tx.Commit(ctx); err != nil {
		return AdminCoupon{}, err
	}
	return s.AdminGetCoupon(ctx, id)
}

// ลบได้เฉพาะคุปองที่ไม่มีคนซื้อ
func (s *Store) DeleteCoupon(ctx context.Context, packageID int64) error {
	tag, err := s.Pool.Exec(ctx,
		`
        DELETE FROM coupon_packages cp
         WHERE cp.package_id = $1 `, packageID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

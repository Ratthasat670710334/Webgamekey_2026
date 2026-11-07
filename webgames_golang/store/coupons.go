package store

import (
	"context"
	"errors"

	//"log"

	"github.com/jackc/pgx/v5"
)

var ErrCouponLimitFull = errors.New("coupon purchase limit reached")

type CouponTitle struct {
	PackageID int     `json:"package_id"`
	Title     string  `json:"title"`
	Price     float64 `json:"price"`
}

type CouponPackage struct {
	PackageID   int     `json:"package_id"`
	GameName    *string `json:"game_name"`
	Title       *string `json:"title"`
	Description *string `json:"description"`
	Price       float64 `json:"price"`
	MaxPerUser  int     `json:"max_per_user"`
	IsActive    bool    `json:"is_active"`
}

func (s *Store) GetCoupon(ctx context.Context) ([]CouponTitle, error) {
	rows, err := s.Pool.Query(ctx,

		`
		SELECT package_id, title ,price
		FROM coupon_packages
		`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []CouponTitle{}

	for rows.Next() {
		var c CouponTitle
		if err := rows.Scan(&c.PackageID, &c.Title, &c.Price); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// SearchCoupon
func (s *Store) SearchCoupons(ctx context.Context, q string) ([]CouponTitle, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT package_id, title ,price
		FROM coupon_packages
        WHERE lower(title) LIKE '%' || lower($1) || '%'
		OR lower(game_name) LIKE '%' || lower($1) || '%'
        ORDER BY package_id`, q)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	out := []CouponTitle{}
	for rows.Next() {
		var c CouponTitle
		if err := rows.Scan(&c.PackageID, &c.Title, &c.Price); err != nil {
			return nil, err
		}

		out = append(out, c)

	}
	return out, rows.Err()
}

// GetCouponDetail หาคูปองจากเลข ไม่พบตอบ ErrNotFound
func (s *Store) GetCouponDetail(ctx context.Context, id int64) (CouponPackage, error) {
	var c CouponPackage
	err := s.Pool.QueryRow(ctx,
		`SELECT package_id ,game_name, title, description ,price, max_per_user
		FROM coupon_packages
			WHERE package_id =$1`, id).
		Scan(&c.PackageID, &c.GameName, &c.Title, &c.Description, &c.Price, &c.MaxPerUser)
	if errors.Is(err, pgx.ErrNoRows) {
		return c, ErrNotFound
	}
	return c, err
}

func (s *Store) BuyCoupon(ctx context.Context, userID int64, packageID int64) (string, error) {
	// เริ่มต้น Transaction (ถ้าขั้นตอนไหนพัง จะยกเลิกทั้งหมดอัตโนมัติ)
	tx, err := s.Pool.Begin(ctx)
	if err != nil {
		return "", err
	}
	defer tx.Rollback(ctx) // จะทำงานถ้าไม่ถึงบรรทัด tx.Commit()

	// 1. เช็คก่อนว่าลูกค้าซื้อเกินโควต้า (max_per_user) หรือยัง?
	var currentBought, maxPerUser int
	checkQuotaSQL := `
		SELECT 
			(SELECT COUNT(*) FROM orders o JOIN coupon_codes c ON o.code_id = c.code_id WHERE o.user_id = $1 AND c.package_id = $2),
			max_per_user,
			price
		FROM coupon_packages WHERE package_id = $2 AND is_active = TRUE`
	var price float64
	err = tx.QueryRow(ctx, checkQuotaSQL, userID, packageID).Scan(&currentBought, &maxPerUser, &price)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", ErrNoCoupon
		}
		return "", err
	}
	if currentBought >= maxPerUser {
		return "", ErrCouponLimitFull
	}

	// 2. ดึงรหัสคูปองที่ว่างอยู่ + ล็อกไม่ให้คนอื่นแย่ง + เปลี่ยนสถานะเป็น sold
	var codeID int
	var couponCode string
	grabCodeSQL := `
		WITH selected_code AS (
			SELECT code_id FROM coupon_codes 
			WHERE package_id = $1 AND status = 'available' 
			LIMIT 1 FOR UPDATE SKIP LOCKED
		)
		UPDATE coupon_codes SET status = 'sold'
		FROM selected_code WHERE coupon_codes.code_id = selected_code.code_id
		RETURNING coupon_codes.code_id, coupon_codes.coupon_code`

	err = tx.QueryRow(ctx, grabCodeSQL, packageID).Scan(&codeID, &couponCode)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNoCoupon
	} else if err != nil {
		return "", err
	}

	// 3. บันทึกลงตารางประวัติการสั่งซื้อ (orders)
	insertOrderSQL := `INSERT INTO orders (user_id, code_id, purchase_price) VALUES ($1, $2, $3)`
	_, err = tx.Exec(ctx, insertOrderSQL, userID, codeID, price)
	if err != nil {
		return "", err
	}

	// ยืนยันการทำรายการทั้งหมดลง Database
	if err := tx.Commit(ctx); err != nil {
		return "", err
	}

	return couponCode, nil
}

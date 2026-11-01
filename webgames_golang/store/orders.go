package store

import (
	"context"
	"errors"
	"fmt"

	//"log"
	"time"

	"github.com/jackc/pgx/v5"
)

var (
	ErrNoCoupon = errors.New("Order not found")
)

type OrderUser struct {
	ID       int64  `json:"id"`
	Username string `json:"Username"`
}

type Orders struct {
	OrderID       int       `json:"order_id"`
	UserID        int64     `json:"user_id"`
	GameName      string    `json:"game_name"`
	Title         string    `json:"title"`
	CouponCode    string    `json:"coupon_code"` // รหัสที่ลูกค้าได้
	PurchasePrice float64   `json:"purchase_price"`
	PurchasedAt   time.Time `json:"purchased_at"`
	User          OrderUser `json:"user"`
}

func (s *Store) ListOrders(ctx context.Context, orderID int64) ([]Orders, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT o.order_id ,
    			o.user_id ,
    			o.code_id , 
    			cp.game_name,
    			cp.title,
    			o.purchase_price ,
    			o.purchased_at,
    			u.username
				FROM orders o
				JOIN users u ON u.user_id = o.user_id 
				JOIN coupon_codes cc ON cc.code_id =o.code_id 
				JOIN  coupon_packages cp ON cp.package_id = cc.package_id
				WHERE o.order_id = $1 ;`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Orders{}
	for rows.Next() {
		var o Orders
		if err := rows.Scan(&o.OrderID, &o.UserID, &o.GameName, &o.Title, &o.CouponCode, &o.PurchasePrice, &o.PurchasedAt, &o.User.Username); err != nil {
			return nil, err
		}
		o.User.ID = o.UserID
		out = append(out, o)
	}
	return out, rows.Err()
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
		return "", fmt.Errorf("คุณซื้อคูปองนี้ครบตามจำนวนที่จำกัดแล้ว (%d/%d)", currentBought, maxPerUser)
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

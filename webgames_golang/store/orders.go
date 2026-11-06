package store

import (
	"context"
	"errors"

	//"log"
	"time"
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

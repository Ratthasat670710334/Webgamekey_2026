package store
/*
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

type OrderbyUser struct {
	OrderID       int       `json:"order_id"`
	GameName      string    `json:"game_name"`
	Title         string    `json:"title"`
	CouponCode    string    `json:"coupon_code"` // รหัสที่ลูกค้าได้
	PurchasePrice float64   `json:"purchase_price"`
	PurchasedAt   time.Time `json:"purchased_at"`
}

func (s *Store) OrdersByuser(ctx context.Context, userID int64) ([]OrderbyUser, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT o.order_id ,
    			cp.game_name,
    			cp.title,
    			cc.coupon_code,
    			o.purchase_price ,
    			o.purchased_at
				FROM orders o
				JOIN coupon_codes cc ON cc.code_id =o.code_id 
				JOIN  coupon_packages cp ON cp.package_id = cc.package_id
				WHERE o.user_id = $1;`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []OrderbyUser{}
	for rows.Next() {
		var o OrderbyUser
		if err := rows.Scan(&o.OrderID, &o.GameName, &o.Title, &o.CouponCode, &o.PurchasePrice, &o.PurchasedAt); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, rows.Err()
}

func (s *Store) GetOrders(ctx context.Context) ([]Orders, error) {
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
				;`)
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
*/
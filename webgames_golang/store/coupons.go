package store

import "context"

type CouponPackage struct {
	PackageID  int     `json:"package_id"`
	GameName   string  `json:"game_name"`
	Title      string  `json:"title"`
	Description string `json:"description"`
	Price      float64 `json:"price"`
	MaxPerUser int     `json:"max_per_user"`
	IsActive   bool    `json:"is_active"`
}

// SearchCouponPackage ค่าจากผู้ใช้เดินทางผ่าน $1 แยกจากคำสั่งเสมอ
func (s *Store) SearchCouponPackages(ctx context.Context, q string) ([]CouponPackage, error) {
    rows, err := s.Pool.Query(ctx,

		`
		
		SELECT package_id ,game_name, title, description ,price, max_per_user
		FROM coupon_packages
			WHERE lower(game_name) LIKE  lower($1)`, q)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    out := []CouponPackage{}

    for rows.Next() {
        var c CouponPackage
        if err := rows.Scan(&c.PackageID ,&c.GameName ,&c.Title,&c.Description ,&c.Price ,&c.MaxPerUser); err != nil {
            return nil, err
        }
        out = append(out, c)
    }
    return out, rows.Err()
}



// DeleteCoupon ลบได้เมื่อเป็นแอดมิน
/*func (s *Store) DeleteCoupon(ctx context.Context, reviewID, memberID int64, isAdmin bool) error {
    tag, err := s.Pool.Exec(ctx,
        `DELETE FROM coupon_packages
         WHERE id = $1 AND (member_id = $2 OR $3)`, package_id, memberID, isAdmin)
    if err != nil {
        return err
    }
    if tag.RowsAffected() == 0 {
        return ErrNotFound
    }
    return nil
}*/
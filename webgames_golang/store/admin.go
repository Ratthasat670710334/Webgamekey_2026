package store

import (
	"context"
	//"errors"
	//"time"
	//"github.com/jackc/pgx/v5"
	//"github.com/jackc/pgx/v5/pgconn"
)

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

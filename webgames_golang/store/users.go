package store

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var ErrEmailTaken = errors.New("email taken")

type User struct {
	ID           int64      `json:"id"`
	Username     string     `json:"username"`
	PasswordHash string     `json:"-"` // ไม่มีวันออกไปกับ JSON
	Email        string     `json:"email"`
	Role         string     `json:"role"`
	CreatedAt    *time.Time `json:"createdAt,omitempty"` // มีเฉพาะตอน list ให้ admin ดู
}

func (s *Store) CreateUser(ctx context.Context, name, hash, email string) (User, error) {
	m := User{Username: name, Email: email}
	err := s.Pool.QueryRow(ctx,
		`INSERT INTO users (username,password_hash,email)
         VALUES ($1, $2, $3)
         RETURNING user_id, role`, name, hash, email).Scan(&m.ID, &m.Role)
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return User{}, ErrEmailTaken
	}
	return m, err
}

func (s *Store) UserByEmail(ctx context.Context, email string) (User, error) {
	var m User
	err := s.Pool.QueryRow(ctx,
		`SELECT user_id, email, username, role, password_hash

         FROM users WHERE lower(email) = $1`, email).
		Scan(&m.ID, &m.Email, &m.Username, &m.Role, &m.PasswordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	return m, err
}

func (s *Store) UserByID(ctx context.Context, id int64) (User, error) {
	var u User
	err := s.Pool.QueryRow(ctx,
		`SELECT user_id, email, username, role, password_hash FROM users WHERE user_id = $1`, id).
		Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.PasswordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	return u, err
}

func (s *Store) UpdateUserPassword(ctx context.Context, id int64, hash string) error {
	tag, err := s.Pool.Exec(ctx,
		`UPDATE users SET password_hash = $2 WHERE user_id = $1`, id, hash)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) ListUsers(ctx context.Context) ([]User, error) {
	rows, err := s.Pool.Query(ctx,
		`SELECT user_id, email, username, role ,created_at FROM users ORDER BY user_id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []User{}
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, rows.Err()
}

// UpdateUserRole เปลี่ยนบทบาท (customer <-> admin) ไม่พบคนตอบ ErrNotFound
func (s *Store) UpdateUserRole(ctx context.Context, id int64, role string) (User, error) {
	var u User
	err := s.Pool.QueryRow(ctx,
		`UPDATE users SET role = $2
         WHERE user_id = $1
         RETURNING user_id, email, username, role, created_at`, id, role).
		Scan(&u.ID, &u.Email, &u.Username, &u.Role, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	return u, err
}

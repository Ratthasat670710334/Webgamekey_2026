package store

import (
    "context"
    "errors"

    "github.com/jackc/pgx/v5/pgconn"
    "github.com/jackc/pgx/v5"
)

var ErrEmailTaken = errors.New("email taken")

type User struct {
    ID           int64  `json:"id"`
    Username  	 string `json:"username"`
    PasswordHash string `json:"-"` // ไม่มีวันออกไปกับ JSON
    Email        string `json:"email"`
    Role         string `json:"role"`
}

func (s *Store) CreateUser(ctx context.Context, name, hash, email string) (User, error) {
    m := User{Username: name ,Email: email}
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
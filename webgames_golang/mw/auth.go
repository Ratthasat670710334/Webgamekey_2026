package mw

import (
    "context"
    "encoding/json"
    "net/http"
    "strings"

    "webgames_golang/auth"
)

type Who struct {
    ID   int64
    Role string
}

type ctxKey struct{}

func WhoFrom(ctx context.Context) Who {
    w, _ := ctx.Value(ctxKey{}).(Who)
    return w
}

func deny(w http.ResponseWriter, status int, code, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(map[string]any{
        "error": map[string]string{"code": code, "message": msg},
    })
}

// RequireLogin คือประตูตรวจตั๋ว ไม่มีตั๋วหรือตั๋วใช้ไม่ได้ ตอบ 401
func RequireLogin(iss *auth.Issuer, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        header := r.Header.Get("Authorization")
        token, found := strings.CutPrefix(header, "Bearer ")
        if !found || token == "" {
            deny(w, http.StatusUnauthorized, "LOGIN_REQUIRED", "กรุณาเข้าสู่ระบบก่อน")
            return
        }
        id, role, err := iss.Parse(token)
        if err != nil {
            deny(w, http.StatusUnauthorized, "TOKEN_INVALID", "ตั๋วใช้ไม่ได้หรือหมดอายุ กรุณาเข้าสู่ระบบใหม่")
            return
        }
        ctx := context.WithValue(r.Context(), ctxKey{}, Who{ID: id, Role: role})
        next(w, r.WithContext(ctx))
    }
}


// RequireRole ใช้ต่อจาก RequireLogin บทบาทไม่ตรง ตอบ 403
func RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if WhoFrom(r.Context()).Role != role {
            deny(w, http.StatusForbidden, "FORBIDDEN", "บัญชีนี้ไม่มีสิทธิ์ทำรายการนี้")
            return
        }
        next(w, r)
    }
}




//ยังไม่เสร็จ
func (s *Store) ListUsers(ctx context.Context) ([]User, error) {
    rows, err := s.Pool.Query(ctx,
        `SELECT id, email, display_name, role FROM members ORDER BY id`)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    out := []Member{}
    for rows.Next() {
        var m Member
        if err := rows.Scan(&m.ID, &m.Email, &m.DisplayName, &m.Role); err != nil {
            return nil, err
        }
        out = append(out, m)
    }
    return out, rows.Err()
}



// DeleteReview ลบได้เมื่อเป็นเจ้าของรีวิว หรือเป็นแอดมิน
func (s *Store) DeleteCoupon(ctx context.Context, reviewID, memberID int64, isAdmin bool) error {
    tag, err := s.Pool.Exec(ctx,
        `DELETE FROM reviews
         WHERE id = $1 AND (member_id = $2 OR $3)`, reviewID, memberID, isAdmin)
    if err != nil {
        return err
    }
    if tag.RowsAffected() == 0 {
        return ErrNotFound
    }
    return nil
}
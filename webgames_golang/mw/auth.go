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

type ctxKey int

const (
	userIDKey ctxKey = iota
	roleKey
)

func UserID(ctx context.Context) (int64, bool) {
	id, ok := ctx.Value(userIDKey).(int64)
	return id, ok
}

// Role คืนบทบาทจากตั๋ว ("member" หรือ "admin") ว่างถ้ายังไม่ได้ login
func Role(ctx context.Context) string {
	role, _ := ctx.Value(roleKey).(string)
	return role
}

func WhoFrom(ctx context.Context) Who {
	w, _ := ctx.Value(userIDKey).(Who)
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
		ctx := context.WithValue(r.Context(), userIDKey, Who{ID: id, Role: role})
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

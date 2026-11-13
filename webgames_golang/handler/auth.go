package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"unicode/utf8"

	"webgames_golang/auth"
	"webgames_golang/mw"
	"webgames_golang/store"
)

type registerReq struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Password    string `json:"password"`
	Email       string `json:"email"`
}

var emailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	username := strings.TrimSpace(req.DisplayName)
	if username == "" {
		username = strings.TrimSpace(req.Username)
	}
	switch {
	case !emailPattern.MatchString(email) || utf8.RuneCountInString(email) > 100:
		writeError(w, http.StatusBadRequest, "BAD_EMAIL", "รูปแบบอีเมลไม่ถูกต้อง")
		return
	case !validPassword(req.Password):
		writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ")
		return
	case username == "" || utf8.RuneCountInString(username) > 50:
		writeError(w, http.StatusBadRequest, "BAD_NAME", "ต้องมีชื่อที่แสดง และยาวไม่เกิน 50 ตัวอักษร")
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		internal(w, err)
		return
	}
	m, err := h.Store.CreateUser(r.Context(), username, hash, email)
	if errors.Is(err, store.ErrEmailTaken) {
		writeError(w, http.StatusConflict, "EMAIL_TAKEN", "อีเมลนี้มีบัญชีอยู่แล้ว")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, memberJSON(m))
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))
	m, err := h.Store.UserByEmail(r.Context(), email)
	if errors.Is(err, store.ErrNotFound) {
		auth.CheckPassword(dummyHash, req.Password)
		writeError(w, http.StatusUnauthorized, "BAD_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	if !auth.CheckPassword(m.PasswordHash, req.Password) {
		writeError(w, http.StatusUnauthorized, "BAD_CREDENTIALS", "อีเมลหรือรหัสผ่านไม่ถูกต้อง")
		return
	}
	token, err := h.Tickets.Issue(m.ID, m.Role)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "member": memberJSON(m)})
}

type changePasswordReq struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type updateProfileReq struct {
	DisplayName     string `json:"displayName"`
	Email           string `json:"email"`
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var req updateProfileReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}

	displayName := strings.TrimSpace(req.DisplayName)
	email := strings.ToLower(strings.TrimSpace(req.Email))
	if !emailPattern.MatchString(email) || utf8.RuneCountInString(email) > 100 {
		writeError(w, http.StatusBadRequest, "BAD_EMAIL", "รูปแบบอีเมลไม่ถูกต้อง")
		return
	}
	if displayName == "" || utf8.RuneCountInString(displayName) > 50 {
		writeError(w, http.StatusBadRequest, "BAD_NAME", "ต้องมีชื่อที่แสดง และยาวไม่เกิน 50 ตัวอักษร")
		return
	}

	passwordHash := ""
	if req.NewPassword != "" {
		if !validPassword(req.NewPassword) {
			writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ")
			return
		}
		who := mw.WhoFrom(r.Context())
		current, err := h.Store.UserByID(r.Context(), who.ID)
		if errors.Is(err, store.ErrNotFound) {
			writeError(w, http.StatusUnauthorized, "LOGIN_REQUIRED", "กรุณาเข้าสู่ระบบก่อน")
			return
		}
		if err != nil {
			internal(w, err)
			return
		}
		if !auth.CheckPassword(current.PasswordHash, req.CurrentPassword) {
			writeError(w, http.StatusUnauthorized, "CURRENT_PASSWORD_INVALID", "รหัสผ่านปัจจุบันไม่ถูกต้อง")
			return
		}
		passwordHash, err = auth.HashPassword(req.NewPassword)
		if err != nil {
			internal(w, err)
			return
		}
	}

	who := mw.WhoFrom(r.Context())
	m, err := h.Store.UpdateUserProfile(r.Context(), who.ID, displayName, email, passwordHash)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "LOGIN_REQUIRED", "กรุณาเข้าสู่ระบบก่อน")
		return
	}
	if errors.Is(err, store.ErrProfileTaken) {
		writeError(w, http.StatusConflict, "PROFILE_TAKEN", "อีเมลหรือชื่อที่แสดงนี้มีผู้ใช้อื่นแล้ว")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}

	writeJSON(w, http.StatusOK, memberJSON(m))
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var req changePasswordReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if !validPassword(req.NewPassword) {
		writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ")
		return
	}

	who := mw.WhoFrom(r.Context())
	m, err := h.Store.UserByID(r.Context(), who.ID)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "LOGIN_REQUIRED", "กรุณาเข้าสู่ระบบก่อน")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	if !auth.CheckPassword(m.PasswordHash, req.CurrentPassword) {
		writeError(w, http.StatusUnauthorized, "CURRENT_PASSWORD_INVALID", "รหัสผ่านปัจจุบันไม่ถูกต้อง")
		return
	}

	hash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		internal(w, err)
		return
	}
	if err := h.Store.UpdateUserPassword(r.Context(), who.ID, hash); errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusUnauthorized, "LOGIN_REQUIRED", "กรุณาเข้าสู่ระบบก่อน")
		return
	} else if err != nil {
		internal(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func validPassword(password string) bool {
	if utf8.RuneCountInString(password) < 8 || len(password) > 72 {
		return false
	}
	var upper, lower, digit, special bool
	for _, r := range password {
		switch {
		case r >= 'A' && r <= 'Z':
			upper = true
		case r >= 'a' && r <= 'z':
			lower = true
		case r >= '0' && r <= '9':
			digit = true
		default:
			special = true
		}
	}
	return upper && lower && digit && special
}

func memberJSON(m store.User) map[string]any {
	role := m.Role
	if role == "customer" {
		role = "member"
	}
	return map[string]any{
		"id":          m.ID,
		"email":       m.Email,
		"displayName": m.Username,
		"role":        role,
	}
}

// dummyHash คือลายนิ้วมือหลอก ใช้เทียบเมื่อไม่พบอีเมล เพื่อให้เสียเวลาเท่ากัน
var dummyHash, _ = auth.HashPassword("ไม่มีใครใช้รหัสนี้")

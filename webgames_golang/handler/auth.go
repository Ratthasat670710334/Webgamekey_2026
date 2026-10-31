package handler

import (
    "encoding/json"
    "errors"
    "net/http"
    "strings"
    "unicode/utf8"

    "webgames_golang/auth"
    "webgames_golang/store"
)

type registerReq struct {
    Username 	string `json:"username"`
    Password    string `json:"password"`
    Email       string `json:"email"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
    var req registerReq
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
        return
    }
    email := strings.ToLower(strings.TrimSpace(req.Email))
    username := strings.TrimSpace(req.Username)
    switch {
    case !strings.Contains(email, "@") || len(email) > 255:
        writeError(w, http.StatusBadRequest, "BAD_EMAIL", "รูปแบบอีเมลไม่ถูกต้อง")
        return
    case utf8.RuneCountInString(req.Password) < 8 || len(req.Password) > 72:
        writeError(w, http.StatusBadRequest, "BAD_PASSWORD", "รหัสผ่านต้องยาว 8 ตัวอักษรขึ้นไป และไม่เกิน 72 ไบต์")
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
    writeJSON(w, http.StatusCreated, m)
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
    writeJSON(w, http.StatusOK, map[string]any{"token": token, "member": m})
}
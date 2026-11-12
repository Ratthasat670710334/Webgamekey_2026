package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"unicode/utf8"

	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) AdminUser(w http.ResponseWriter, r *http.Request) {
	ms, err := h.Store.ListUsers(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ms})
}

func (h *Handler) AdminStats(w http.ResponseWriter, r *http.Request) {
	ms, err := h.Store.Stats(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ms})
}

type roleReq struct {
	Role string `json:"role"`
}

// AdminSetRole เลื่อนหรือลดบทบาท ห้ามแก้ของตัวเอง (กัน admin คนสุดท้ายลดตัวเองจนไม่มีใครเข้าหลังบ้านได้)
func (h *Handler) AdminSetRole(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขสมาชิกต้องเป็นตัวเลข")
		return
	}
	var req roleReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if req.Role != "customer" && req.Role != "admin" {
		writeError(w, http.StatusBadRequest, "BAD_ROLE", "role ต้องเป็น customer หรือ admin")
		return
	}
	if me, _ := mw.UserID(r.Context()); me == id {
		writeError(w, http.StatusBadRequest, "SELF_ROLE", "เปลี่ยนบทบาทของตัวเองไม่ได้ ให้ admin คนอื่นทำแทน")
		return
	}
	m, err := h.Store.UpdateUserRole(r.Context(), id, req.Role)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "USER_NOT_FOUND", "ไม่พบสมาชิกคนนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

type CouponReq struct {
	ID int64 `json:"id"` // ใช้เฉพาะตอนสร้าง: ใส่เลข TMDB เองก็ได้ หรือ 0 ให้ระบบออกเลข
	store.CouponInput
}

func validateCoupon(in *store.CouponInput) (code, message string) {
	if in.GameName != nil {
		v := strings.TrimSpace(*in.GameName)
		*in.GameName = v
	}
	if in.Title != nil {
		v := strings.TrimSpace(*in.Title)
		*in.Title = v
	}
	if in.Description != nil {
		v := strings.TrimSpace(*in.Description)
		*in.Description = v
	}

	switch {
	case in.GameName == nil || *in.GameName == "" || utf8.RuneCountInString(*in.GameName) > 100:
		return "BAD_GAME_NAME", "ต้องมีชื่อเกม และยาวไม่เกิน 100 ตัวอักษร"
	case in.Title == nil || *in.Title == "" || utf8.RuneCountInString(*in.Title) > 150:
		return "BAD_TITLE", "ต้องมีชื่อแพ็กเกจ และยาวไม่เกิน 150 ตัวอักษร"
	case in.Price == nil || *in.Price < 0:
		return "BAD_PRICE", "ราคาต้องเป็น 0 ขึ้นไป"
	case in.MaxPerUser == nil || *in.MaxPerUser < 1:
		return "BAD_LIMIT", "จำนวนซื้อสูงสุดต่อคนต้องเป็นอย่างน้อย 1"
	}
	if in.Description == nil {
		description := "---"
		in.Description = &description
	} else if *in.Description == "" {
		*in.Description = "---"
	}
	return "", ""
}

func (h *Handler) AdminGetCoupon(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็นตัวเลข")
		return
	}
	m, err := h.Store.AdminGetCoupon(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "COUPON_NOT_FOUND", "ไม่พบคูปองนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

func (h *Handler) AdminCreateCoupon(w http.ResponseWriter, r *http.Request) {
	var req CouponReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if req.ID < 0 {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็น 0 (ให้ระบบออก) หรือเลขบวก")
		return
	}
	if code, msg := validateCoupon(&req.CouponInput); code != "" {
		writeError(w, http.StatusBadRequest, code, msg)
		return
	}
	m, err := h.Store.CreateCoupon(r.Context(), req.ID, req.CouponInput)
	switch {
	case errors.Is(err, store.ErrDuplicateID):
		writeError(w, http.StatusConflict, "COUPON_EXISTS", "มีคูปองเลขนี้อยู่แล้ว")
		return
	case err != nil:
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, m)
}

func (h *Handler) AdminUpdateCoupon(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็นตัวเลข")
		return
	}
	var req CouponReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if code, msg := validateCoupon(&req.CouponInput); code != "" {
		writeError(w, http.StatusBadRequest, code, msg)
		return
	}
	m, err := h.Store.UpdateCoupon(r.Context(), id, req.CouponInput)
	switch {
	case errors.Is(err, store.ErrNotFound):
		writeError(w, http.StatusNotFound, "MOVIE_NOT_FOUND", "ไม่พบคูปองนี้")
		return
	case err != nil:
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, m)
}

func (h *Handler) AdminDeleteCoupon(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็นตัวเลข")
		return
	}
	err := h.Store.DeleteCoupon(r.Context(), id)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "COUPON_NOT_FOUND", "ไม่พบคูปองนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent) // ลบแล้ว ไม่มีอะไรให้ส่งกลับ
}

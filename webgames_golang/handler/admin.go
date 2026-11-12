package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) AdminUser(w http.ResponseWriter, r *http.Request) {
	ms, err := h.Store.ListUsers(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	items := make([]map[string]any, 0, len(ms))
	for _, m := range ms {
		item := memberJSON(m)
		item["createdAt"] = m.CreatedAt
		items = append(items, item)
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
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
	role := req.Role
	if role == "member" {
		role = "customer"
	}
	if role != "customer" && role != "admin" {
		writeError(w, http.StatusBadRequest, "BAD_ROLE", "role ต้องเป็น member หรือ admin")
		return
	}
	if me, _ := mw.UserID(r.Context()); me == id {
		writeError(w, http.StatusBadRequest, "SELF_ROLE", "เปลี่ยนบทบาทของตัวเองไม่ได้ ให้ admin คนอื่นทำแทน")
		return
	}
	m, err := h.Store.UpdateUserRole(r.Context(), id, role)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "USER_NOT_FOUND", "ไม่พบสมาชิกคนนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	item := memberJSON(m)
	item["createdAt"] = m.CreatedAt
	writeJSON(w, http.StatusOK, item)
}

/*
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
	case in.Title == nil || *in.Title == "" || utf8.RuneCountInString(*in.GameName) > 255:
		return "BAD_TITLE", "ต้องมีชื่อเกม และยาวไม่เกิน 255 ตัวอักษร"
	case in.Title == nil || *in.Title == "" || utf8.RuneCountInString(*in.Title) > 255:
		return "BAD_TITLE", "ต้องมีชื่อเรื่อง และยาวไม่เกิน 255 ตัวอักษร"
	}
	if *in.Description == "" {
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

*/

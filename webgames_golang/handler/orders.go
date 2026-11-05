package handler

import (
	"errors"
	"net/http"

	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, m)
}



func (h *Handler) BuyCoupon(w http.ResponseWriter, r *http.Request) {
	packageID, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็นตัวเลข")
		return
	}

	who := mw.WhoFrom(r.Context()) // เลขสมาชิกมาจากตั๋วเท่านั้น
	couponCode, err := h.Store.BuyCoupon(r.Context(), who.ID, packageID)
	switch {

	case errors.Is(err, store.ErrNoCoupon):
		writeError(w, http.StatusNotFound, "COUPON_NOT_FOUND", "ไม่พบคูปองนี้")
		return
	case err != nil:
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"coupon_code": couponCode})
}




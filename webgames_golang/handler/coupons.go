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

func (h *Handler) SearchCouponPackages(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.SearchCouponPackages(r.Context(), r.URL.Query().Get("q"))
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
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

func (h *Handler) DeleteCoupon(w http.ResponseWriter, r *http.Request) {
	packageID, ok := pathID(r, "packageId")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขคูปองต้องเป็นตัวเลข")
		return
	}
	//who := mw.WhoFrom(r.Context())
	err := h.Store.DeleteCoupon(r.Context(), packageID)
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "PACKAGE_NOT_FOUND", "ไม่พบคูปองนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

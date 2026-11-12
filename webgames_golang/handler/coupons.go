
package handler
/*
import (
	"errors"
	"net/http"

	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) GetCoupon(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.GetCoupon(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) SearchCoupons(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.SearchCoupons(r.Context(), r.URL.Query().Get("q"))
	if err != nil {
		internal(w, err)
		return
	}
	if errors.Is(err, store.ErrNotFound) {
		writeError(w, http.StatusNotFound, "COUPON_NOT_FOUND", "ไม่พบหนังเรื่องนี้")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) GetCouponDetail(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขหนังต้องเป็นตัวเลข")
		return
	}
	m, err := h.Store.GetCouponDetail(r.Context(), id)
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

	case errors.Is(err, store.ErrCouponLimitFull):
		writeError(w, http.StatusNotFound, "COUPON_LIMIT_FULL", "คุณซื้อคูปองนี้ครบตามจำนวนที่จำกัดแล้ว")
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
*/
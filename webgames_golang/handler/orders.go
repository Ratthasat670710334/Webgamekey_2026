package handler

import (
	"errors"
	"net/http"
	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) GetOrders(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.GetOrders(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) Orders(w http.ResponseWriter, r *http.Request) {
	who := mw.WhoFrom(r.Context())
	m, err := h.Store.OrdersByuser(r.Context(), who.ID)
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

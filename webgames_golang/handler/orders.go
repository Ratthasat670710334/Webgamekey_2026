package handler

import (
	"net/http"

	"webgames_golang/mw"
)

func (h *Handler) GameOrders(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.GameOrders(r.Context(), mw.WhoFrom(r.Context()).ID)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) AdminGameOrders(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.AdminGameOrders(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

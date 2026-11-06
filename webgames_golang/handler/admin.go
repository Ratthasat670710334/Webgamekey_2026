package handler

import (
	"net/http"
)

func (h *Handler) AdminUser(w http.ResponseWriter, r *http.Request) {
	ms, err := h.Store.ListUsers(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": ms})
}

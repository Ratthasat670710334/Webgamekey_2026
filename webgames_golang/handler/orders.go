package handler

import (
	"net/http"
)

func (h *Handler) ListOrders(w http.ResponseWriter, r *http.Request) {
	orderID, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขออเดอร์ต้องเป็นตัวเลข")
		return
	}
	items, err := h.Store.ListOrders(r.Context(), orderID)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

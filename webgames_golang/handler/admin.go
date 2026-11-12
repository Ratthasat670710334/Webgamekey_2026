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

func (h *Handler) GameDashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := h.Store.GameDashboardStats(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, stats)
}

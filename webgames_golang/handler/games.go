package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"webgames_golang/mw"
	"webgames_golang/store"
)

func (h *Handler) Games(w http.ResponseWriter, r *http.Request) {
	items, err := h.Store.GetGames(r.Context(), strings.TrimSpace(r.URL.Query().Get("q")), strings.TrimSpace(r.URL.Query().Get("genre")))
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *Handler) Game(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมต้องเป็นตัวเลข")
		return
	}
	item, err := h.Store.GetGame(r.Context(), id)
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func validGame(in *store.GameInput) bool {
	in.Title = strings.TrimSpace(in.Title)
	in.Genre = strings.TrimSpace(in.Genre)
	in.Platform = strings.TrimSpace(in.Platform)
	in.Region = strings.TrimSpace(in.Region)
	in.Poster = strings.TrimSpace(in.Poster)
	in.Detail = strings.TrimSpace(in.Detail)
	in.Status = strings.TrimSpace(in.Status)
	if in.Status == "" {
		in.Status = "พร้อมจำหน่าย"
	}
	return in.Title != "" && in.Genre != "" && in.Price >= 0 &&
		in.DiscountPrice >= 0 && in.Discount >= 0 && in.Discount <= 100 &&
		in.Rating >= 0 && in.Rating <= 10 && in.Platform != "" &&
		in.Region != ""
}

func (h *Handler) AdminCreateGame(w http.ResponseWriter, r *http.Request) {
	var in store.GameInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if !validGame(&in) || in.ID < 0 {
		writeError(w, http.StatusBadRequest, "BAD_GAME", "กรุณากรอกข้อมูลเกมและราคาให้ถูกต้อง")
		return
	}
	item, err := h.Store.CreateGame(r.Context(), in)
	if errors.Is(err, store.ErrDuplicateGame) {
		writeError(w, http.StatusConflict, "GAME_EXISTS", "มีเลขเกมนี้ในระบบแล้ว")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) AdminUpdateGame(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมต้องเป็นตัวเลข")
		return
	}
	var in store.GameInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if !validGame(&in) {
		writeError(w, http.StatusBadRequest, "BAD_GAME", "กรุณากรอกข้อมูลเกมและราคาให้ถูกต้อง")
		return
	}
	item, err := h.Store.UpdateGame(r.Context(), id, in)
	if errors.Is(err, store.ErrGameNotFound) {
		writeError(w, http.StatusNotFound, "GAME_NOT_FOUND", "ไม่พบเกมนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handler) AdminDeleteGame(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมต้องเป็นตัวเลข")
		return
	}
	if err := h.Store.DeleteGame(r.Context(), id); errors.Is(err, store.ErrGameNotFound) {
		writeError(w, http.StatusNotFound, "GAME_NOT_FOUND", "ไม่พบเกมนี้")
		return
	} else if errors.Is(err, store.ErrGameInUse) {
		writeError(w, http.StatusConflict, "GAME_IN_USE", "เกมที่มีประวัติการซื้อแล้วไม่สามารถลบได้")
		return
	} else if err != nil {
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AdminListGameKeys(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมต้องเป็นตัวเลข")
		return
	}
	items, err := h.Store.ListGameKeys(r.Context(), id)
	if errors.Is(err, store.ErrGameNotFound) {
		writeError(w, http.StatusNotFound, "GAME_NOT_FOUND", "ไม่พบเกมนี้")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

type keysRequest struct {
	Keys []string `json:"keys"`
}

func (h *Handler) AdminAddGameKeys(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(r, "id")
	if !ok {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมต้องเป็นตัวเลข")
		return
	}
	var req keysRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	keys := make([]string, 0, len(req.Keys))
	for _, key := range req.Keys {
		key = strings.TrimSpace(key)
		if key != "" {
			keys = append(keys, key)
		}
	}
	if len(keys) == 0 || len(keys) > 500 {
		writeError(w, http.StatusBadRequest, "BAD_KEYS", "กรุณาระบุ CD-Key 1 ถึง 500 รายการ")
		return
	}
	items, err := h.Store.AddGameKeys(r.Context(), id, keys)
	if errors.Is(err, store.ErrGameNotFound) {
		writeError(w, http.StatusNotFound, "GAME_NOT_FOUND", "ไม่พบเกมนี้")
		return
	}
	if errors.Is(err, store.ErrDuplicateGameKey) {
		writeError(w, http.StatusConflict, "KEY_EXISTS", "มี CD-Key อย่างน้อยหนึ่งรายการอยู่ในระบบแล้ว")
		return
	}
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"items": items})
}

func (h *Handler) AdminDeleteGameKey(w http.ResponseWriter, r *http.Request) {
	gameID, gameOK := pathID(r, "id")
	keyID, keyOK := pathID(r, "keyId")
	if !gameOK || !keyOK {
		writeError(w, http.StatusBadRequest, "BAD_ID", "เลขเกมหรือ CD-Key ไม่ถูกต้อง")
		return
	}
	if err := h.Store.DeleteGameKey(r.Context(), gameID, keyID); err != nil {
		if errors.Is(err, store.ErrGameKeyNotFound) {
			writeError(w, http.StatusNotFound, "KEY_NOT_FOUND", "ไม่พบ CD-Key นี้")
			return
		}
		internal(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type buyGameRequest struct {
	GameID   int64 `json:"gameId"`
	Quantity int   `json:"quantity"`
}

func (h *Handler) BuyGame(w http.ResponseWriter, r *http.Request) {
	var req buyGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "BAD_JSON", "อ่านกล่อง JSON ไม่ออก")
		return
	}
	if req.GameID <= 0 || req.Quantity < 1 {
		writeError(w, http.StatusBadRequest, "BAD_ORDER", "ต้องเลือกเกมและจำนวนคีย์อย่างน้อย 1")
		return
	}
	order, err := h.Store.BuyGame(r.Context(), mw.WhoFrom(r.Context()).ID, req.GameID, req.Quantity)
	switch {
	case errors.Is(err, store.ErrGameNotFound):
		writeError(w, http.StatusNotFound, "GAME_NOT_FOUND", "ไม่พบเกมนี้")
	case errors.Is(err, store.ErrInsufficientKeys):
		writeError(w, http.StatusConflict, "OUT_OF_STOCK", "CD-Key คงเหลือไม่เพียงพอ")
	case err != nil:
		internal(w, err)
	default:
		writeJSON(w, http.StatusCreated, order)
	}
}

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

func (h *Handler) GameDashboard(w http.ResponseWriter, r *http.Request) {
	stats, err := h.Store.GameDashboardStats(r.Context())
	if err != nil {
		internal(w, err)
		return
	}
	writeJSON(w, http.StatusOK, stats)
}

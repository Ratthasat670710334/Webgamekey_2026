package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"webgames_golang/auth"
	"webgames_golang/handler"
	"webgames_golang/mw"
	"webgames_golang/store"
)

func main() {
	secret := os.Getenv("JWT_SECRET")
	if len(secret) < 32 {
		log.Fatal("JWT_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษร")
	}
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal("ต่อฐานข้อมูลไม่ติด ", err)
	}

	tickets := &auth.Issuer{Secret: []byte(secret), TTL: time.Hour}
	h := &handler.Handler{Store: &store.Store{Pool: pool}, Tickets: tickets}

	// login = ต้องมีตั๋ว, admin = ต้องมีตั๋วและบทบาทเป็น admin (ตรวจตั๋วก่อนเสมอ ค่อยดูบทบาท)
	login := func(next http.HandlerFunc) http.HandlerFunc { return mw.RequireLogin(tickets, next) }

	mux := http.NewServeMux()

	//Auth
	mux.HandleFunc("POST /api/auth/register", h.Register)
	mux.HandleFunc("POST /api/auth/login", h.Login)
	mux.HandleFunc("GET /api/users/me", login(h.Me))

	//Customers

	mux.HandleFunc("GET /api/coupons", h.GetCoupon)
	//mux.HandleFunc("GET /api/coupons", h.SearchCoupon)
	mux.HandleFunc("GET /api/coupons/{id}", h.GetCouponDetail)

	//ยังไม่เสร็จ
	mux.HandleFunc("POST /api/coupons/{id}/buy", login(h.BuyCoupon))
	mux.HandleFunc("GET /api/users/me/{id}/orders", login(h.Orders))

	//Admin
	mux.HandleFunc("GET /api/admin/users", login(mw.RequireRole("admin", h.AdminUser)))
	//mux.HandleFunc("POST /api/admin/coupons", login(mw.RequireRole("admin", h.AddCoupon)))
	//mux.HandleFunc("PUT /api/admin/coupons/{packageId}", login(mw.RequireRole("admin", h.EditCoupon)))
	mux.HandleFunc("DELETE /api/admin/coupons/{packageId}", login(mw.RequireRole("admin", h.DeleteCoupon)))

	origins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	log.Println("MovieHub API ฟังอยู่ที่ :8080 ต้อนรับ", origins)
	log.Fatal(http.ListenAndServe(":8080", mw.Logging(mw.CORS(origins, mux))))
}

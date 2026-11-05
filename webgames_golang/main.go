package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "time"
    "strings"

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
    login := func(f http.HandlerFunc) http.HandlerFunc { return mw.RequireLogin(tickets, f) }


    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/me", login(h.Me))
    mux.HandleFunc("POST /api/coupons/{id}/buy", login(h.BuyCoupon))
    mux.HandleFunc("POST /api/auth/register", h.Register)
    mux.HandleFunc("POST /api/auth/login", h.Login)
    mux.HandleFunc("GET /api/webgames_key", h.SearchCouponPackages)
    mux.HandleFunc("GET /api/webgames_key/{id}/Orders", h.ListOrders)

    //mux.HandleFunc("DELETE /api//admin/coupons/deletecoupons/{CouponId}", login(h.DeleteCoupon))

    mux.HandleFunc("GET /api/admin/members", login(mw.RequireRole("admin", h.AdminUser)))

    origins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
    log.Println("MovieHub API ฟังอยู่ที่ :8080 ต้อนรับ", origins)
    log.Fatal(http.ListenAndServe(":8080", mw.Logging(mw.CORS(origins, mux))))
}
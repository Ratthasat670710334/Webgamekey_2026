package main

import (
    "context"
    "log"
    "net/http"
    "os"
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
    login := func(f http.HandlerFunc) http.HandlerFunc { return mw.RequireLogin(tickets, f) }


    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/me", login(h.Me))
    mux.HandleFunc("POST /api/movies/{id}/reviews", login(h.BuyCoupon))
    mux.HandleFunc("POST /api/auth/register", h.Register)
    mux.HandleFunc("POST /api/auth/login", h.Login)
    mux.HandleFunc("GET /api/webgames_key", h.SearchCouponPackages)
    mux.HandleFunc("GET /api/webgames_key/{id}/Orders", h.ListOrders)

    log.Println("เว็บขายคูปองเกม API ฟังอยู่ที่ :8080")
    log.Fatal(http.ListenAndServe(":8080", mw.Logging(mux)))
}
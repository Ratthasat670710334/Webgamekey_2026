package main

import (
    "context"
    "log"
    "net/http"
    "os"

    "github.com/jackc/pgx/v5/pgxpool"

    "webgames_golang/handler"
    "webgames_golang/mw"
    "webgames_golang/store"
)

func main() {
    pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Close()
    if err := pool.Ping(context.Background()); err != nil {
        log.Fatal("ต่อฐานข้อมูลไม่ติด ", err)
    }

    h := &handler.Handler{Store: &store.Store{Pool: pool}}

    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/webgames_key", h.SearchCouponPackage)
    mux.HandleFunc("GET /api/webgames_key/{id}/Orders", h.ListOrders)

    log.Println("เว็บขายคูปองเกม API ฟังอยู่ที่ :8080")
    log.Fatal(http.ListenAndServe(":8080", mw.Logging(mux)))
}
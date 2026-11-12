# GAMEKEY STORE

The storefront is in `webgames_react/`, the Go API is in `webgames_golang/`,
and PostgreSQL schema/catalog setup is in `webgames_db/`.

## Local development

1. Follow `webgames_db/README_DB.md` to start PostgreSQL and load the schema and
   100-game catalog.
2. Start the API from `webgames_golang/` with `DATABASE_URL`, a `JWT_SECRET`
   (at least 32 characters), and `ALLOWED_ORIGINS=http://localhost:3000`, then
   run `go run .`.
3. Start the React app from `webgames_react/` with `npm start`. Its development
   proxy sends `/api` requests to Go on port 8080.

Purchases require an authenticated account and available CD-Keys. Register an
account, assign its admin role through a trusted database session, and add
valid keys in the Admin interface before testing checkout.

Run Go tests from `webgames_golang/` with `go test ./...`. React tests are
available from `webgames_react/` with `npm test -- --watchAll=false --runInBand`.

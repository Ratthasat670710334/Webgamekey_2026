# Running the GAMEKEY API locally

1. Start PostgreSQL and load the schema/catalog from `webgames_db/README_DB.md`.
2. From `webgames_golang/`, set `DATABASE_URL`, a `JWT_SECRET` of at least 32
   characters, and `ALLOWED_ORIGINS=http://localhost:3000`.
3. Run `go run .`; the API listens on port 8080 by default.
4. From `webgames_react/`, run `npm start`; its development proxy forwards
   `/api` requests to the Go API.

Run the unit tests with:

```sh
go test ./...
```

The optional API integration test creates a temporary member and needs a
separately provisioned admin token:

```sh
API_BASE_URL=http://localhost:8080 API_ADMIN_TOKEN="$API_ADMIN_TOKEN" \
  go test -run TestAPIAllRoutes
```

## Storefront API

| Method | Path | Access |
|---|---|---|
| GET | `/api/games?q=&genre=` | Public catalog |
| GET | `/api/games/{id}` | Public game details and available-key count |
| POST | `/api/game-orders` | Member; body `{ "gameId": 1, "quantity": 1 }` |
| GET | `/api/users/me/game-orders` | Member's order history and purchased keys |
| PUT | `/api/users/me/password` | Member; body `{ "currentPassword": "...", "newPassword": "..." }`; returns 204 |
| GET/POST | `/api/admin/games/{id}/keys` | Admin key inventory |
| POST/PUT/DELETE | `/api/admin/games[/{id}]` | Admin game catalog |
| GET | `/api/admin/dashboard` | Admin dashboard summary |

Changing a password requires the current password and the same password rules
as registration. Success returns `204 No Content`; an invalid new password
returns `400 BAD_PASSWORD`, and an incorrect current password returns
`401 CURRENT_PASSWORD_INVALID`.

Purchases reserve available keys and create the order in one database
transaction. The catalog seed does not generate fake keys; an admin must add
valid keys before a game can be purchased.

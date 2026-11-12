# GAMEKEY database

`schema.sql` defines the account, catalog, key inventory, and order tables.
`seed.sql` upserts all 100 storefront games from `webgames_react/src/data/games.js`.
`gamekeycd_dump.sql` is a standalone combined import script; it creates missing
tables and updates catalog rows without dropping existing data.

## Local setup

From `webgames_db/`:

```sh
docker compose up -d
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seed.sql
```

Set `DATABASE_URL` to the local PostgreSQL connection string before running
those commands. Start the Go API from `webgames_golang/` with `DATABASE_URL`
and a `JWT_SECRET` of at least 32 characters. The React development proxy
forwards `/api` requests to `http://localhost:8080`.

The seed intentionally contains catalog records only; it does not create
default users or pretend CD-Keys are real. Register a user, grant admin role
through a trusted database session, and add valid keys in the Admin interface
before enabling purchases.

`gamekeycd_dump.sql` is re-runnable, but the schema and game catalog changes
should still be reviewed before applying them to a hosted database.

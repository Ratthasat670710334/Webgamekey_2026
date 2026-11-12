# GAMEKEY STORE frontend

The React app reads game catalog, inventory, account, checkout, order history,
and admin data from the Go API. For local development:

1. Start PostgreSQL and load `webgames_db/schema.sql` and `seed.sql`.
2. Start the Go API on port 8080.
3. Run `npm start` in this directory. The development proxy forwards `/api`
   to `http://localhost:8080`.

For a deployed API, set `REACT_APP_API_URL` to its base URL and configure the
API's allowed origins. Install dependencies with `npm install`; run tests with
`npm test -- --watchAll=false --runInBand`.

# SQL Server registration and login

The login and registration pages use this Express server for account operations. The browser never connects directly to SQL Server.

## Prerequisites

- Node.js 20 or newer
- SQL Server with SQL Authentication enabled and a database created for this app
- A dedicated SQL Server login with `SELECT` and `INSERT` permission on `dbo.Accounts`

## Setup

1. In SQL Server Management Studio, create a database (for example, `LoginApp`), select it, and run `database/schema.sql`.
2. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`).
3. Set `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` to your SQL Server connection details. Replace `SESSION_SECRET` with a private random value of at least 32 characters. Never commit `.env`.
4. Install packages with `npm install`.
5. Start the app with `npm start`, then open `http://localhost:3001/login.html`.

For local SQL Server certificates, `DB_TRUST_SERVER_CERTIFICATE=true` may be useful. Use a properly trusted certificate and set it to `false` in production.

Passwords are stored as bcrypt hashes. The server validates registration data, uses parameterized SQL queries, rate-limits authentication requests, and protects the website landing page with a session. The default Express session store is in-memory and is intended only for local development; replace it with a persistent session store before deploying or running multiple server instances. Use HTTPS in production.

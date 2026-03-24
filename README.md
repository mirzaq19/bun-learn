# Bun Learn

A backend web application built with [Bun](https://bun.sh/), [ElysiaJS](https://elysiajs.com/), [Drizzle ORM](https://orm.drizzle.team/), and MySQL. This project demonstrates user authentication handling, including registration, login, session management, and protecting routes.

## Folder Structure & Naming Conventions

The project uses a structured, feature-based architecture with kebab-case file naming inside `src` and `tests` directories.

```
bun-learn/
├── src/
│   ├── db/          # Database configuration and schema definitions (e.g., schema.ts)
│   ├── routes/      # API route definitions and request validation (e.g., users-route.ts)
│   ├── services/    # Business logic and database interactions (e.g., users-service.ts)
│   └── index.ts     # Application entry point
├── tests/           # Automated test suites and helpers (e.g., users.test.ts, helper.ts)
├── drizzle/         # Generated Drizzle database migrations
└── ...
```

## Available APIs

All routes are prefixed with `/api`.

### Users API

| Method | Endpoint | Description | Request Body | Headers |
|---|---|---|---|---|
| `POST` | `/api/users` | Register a new user. | `{ "name": "...", "email": "...", "password": "..." }` | None |
| `POST` | `/api/users/login` | Login and create a session. | `{ "email": "...", "password": "..." }` | None |
| `GET` | `/api/users/current` | Get current logged-in user profile. | None | `Authorization: Bearer <token>` |
| `DELETE` | `/api/users/logout` | Logout and invalidate session token. | None | `Authorization: Bearer <token>` |

## Database Schema

The application uses MySQL and defines the following tables via Drizzle ORM:

### `users`
- `id` (int, Primary Key, Auto Increment)
- `name` (varchar(255), Not Null)
- `email` (varchar(255), Not Null, Unique)
- `password` (varchar(255), Not Null)
- `created_at` (timestamp, Default: CURRENT_TIMESTAMP)

### `sessions`
- `id` (int, Primary Key, Auto Increment)
- `token` (varchar(255), Not Null)
- `user_id` (int, Not Null, Foreign Key to `users.id`)
- `created_at` (timestamp, Default: CURRENT_TIMESTAMP)

## Tech Stack
- **Runtime**: [Bun](https://bun.sh/)
- **Language**: TypeScript
- **Web Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL

## Libraries Used
- `elysia` (^1.4.28)
- `drizzle-orm` (^0.45.1)
- `mysql2` (^3.20.0)
- `drizzle-kit` (^0.31.10) - Dev dependency for migrations.

## Setup Project

1. Ensure you have [Bun](https://bun.sh/) installed.
2. Clone the repository and install dependencies:
   ```bash
   bun install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and configure your database URL:
   ```env
   # Example: DATABASE_URL="mysql://user:password@localhost:3306/db_name"
   DATABASE_URL="..."
   ```

## How to Run

1. Generate and push database schema to your MySQL instance:
   ```bash
   bun run db:generate
   bun run db:push
   ```
2. Start the development server (runs with watch mode):
   ```bash
   bun run dev
   ```
   *The server will start at `http://localhost:3000` or the explicitly defined host/port.*

## How to Test

The project includes an automated test suite powered by `bun test`. Ensure your test database is setup properly if necessary.

Run all tests:
```bash
bun test
```

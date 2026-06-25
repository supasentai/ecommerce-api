# E-commerce Backend API

[![CI](https://github.com/supasentai/ecommerce-backend-api/actions/workflows/ci.yml/badge.svg)](https://github.com/supasentai/ecommerce-backend-api/actions/workflows/ci.yml)

## Overview

E-commerce Backend API is a RESTful backend service for a full-stack e-commerce project. It is built with NestJS, TypeScript, Prisma ORM, and PostgreSQL, and provides the API layer consumed by a Next.js frontend.

The project demonstrates a modular backend architecture with authentication, role-based authorization, product catalog APIs, cart workflows, checkout, order tracking, request validation, centralized error formatting, Swagger/OpenAPI documentation, and Prisma-based database management.

Local services:

- Backend API: `http://localhost:3000`
- Frontend app: `http://localhost:3001`
- Swagger UI: `http://localhost:3000/api/docs`
- Frontend repository: [https://github.com/supasentai/ecommerce-frontend-nextjs](https://github.com/supasentai/ecommerce-frontend-nextjs)

## Features

- REST API built with NestJS modules, controllers, services, DTOs, guards, filters, and interceptors
- PostgreSQL persistence through Prisma ORM
- Prisma schema with `User`, `Category`, `Product`, `CartItem`, `Order`, and `OrderItem` models
- Database migrations stored in `prisma/migrations`
- Seed script for demo users, categories, and products
- JWT authentication with access tokens and refresh token rotation
- Password hashing with bcrypt
- Register, login, refresh token, logout, profile, profile update, and password change endpoints
- Role-based access control for `USER` and `ADMIN`
- Product listing with pagination, search, category filter, active-status filter, price range filter, and sorting
- Product detail endpoint by product `id`
- Admin-only product create, update, and delete endpoints
- Category listing and admin-only category management
- Authenticated cart item management
- Checkout from cart with transactional stock decrement
- User order history, order detail, and pending-order cancellation
- Admin order listing, order detail, and order status update endpoints
- Admin user management endpoints
- Global validation pipe with whitelist and request transformation
- Global response transform interceptor and HTTP exception filter
- CORS configured for the local Next.js frontend at `http://localhost:3001`
- Swagger/OpenAPI documentation at `/api/docs`
- Jest unit and e2e test scripts

## Tech Stack

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Passport JWT
- `@nestjs/jwt`
- `@nestjs/config`
- `@nestjs/swagger`
- `@nestjs/throttler`
- bcrypt
- class-validator
- class-transformer
- Jest
- Supertest
- Docker Compose

## Project Structure

```text
ecommerce-backend-api/
|-- docs/
|   |-- ecommerce-api.postman_collection.json
|   |-- ecommerce-erd.mmd
|   `-- ecommerce-erd.svg
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.ts
|-- src/
|   |-- common/
|   |   |-- decorators/
|   |   |-- filters/
|   |   |-- guards/
|   |   |-- interceptors/
|   |   `-- pagination/
|   |-- config/
|   |-- modules/
|   |   |-- auth/
|   |   |-- cart/
|   |   |-- categories/
|   |   |-- orders/
|   |   |-- products/
|   |   `-- users/
|   |-- prisma/
|   |-- app.module.ts
|   `-- main.ts
|-- test/
|-- docker-compose.yml
|-- Dockerfile
|-- package.json
`-- README.md
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL connection string and JWT secret.

Start the local PostgreSQL service with Docker Compose:

```bash
docker compose up -d postgres
```

Run database migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed demo data:

```bash
npm run seed
```

Start the API in development mode:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

## Environment Variables

This project includes a `.env.example` file:

```env
PORT=3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

Environment variables used by the application:

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Port used by the NestJS server. |
| `DATABASE_URL` | Yes | None | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Yes | None | Secret used to sign and verify JWTs. |
| `JWT_EXPIRES_IN` | No | `7d` | Access token expiration passed to `@nestjs/jwt`. |

The app validates environment variables during startup and fails fast if `DATABASE_URL`, `JWT_SECRET`, or a valid `PORT` value is missing.

## Database Setup

The Prisma datasource is configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

For local development, the included `docker-compose.yml` can start a PostgreSQL database:

```bash
docker compose up -d postgres
```

Default local database settings:

| Setting | Value |
| --- | --- |
| Database | `ecommerce_db` |
| Username | `postgres` |
| Password | `postgres` |
| Host port | `5432` |

After the database is running, apply migrations and seed demo data:

```bash
npx prisma migrate dev
npm run seed
```

The seed script creates demo users, categories, and products. Demo account password:

```text
Password123!
```

Seeded accounts:

| Role | Email |
| --- | --- |
| Admin | `admin@example.com` |
| User | `user1@example.com` |
| User | `user2@example.com` |

## Prisma Commands

Generate Prisma Client:

```bash
npx prisma generate
```

Create and apply a development migration:

```bash
npx prisma migrate dev
```

Apply pending migrations in production or CI:

```bash
npx prisma migrate deploy
```

Open Prisma Studio:

```bash
npx prisma studio
```

Run the project seed script:

```bash
npm run seed
```

Note: this project currently exposes seeding through the `npm run seed` script, which runs `ts-node prisma/seed.ts`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run build` | Compile the NestJS application. |
| `npm run format` | Format source and test files with Prettier. |
| `npm run start` | Start the NestJS application. |
| `npm run start:dev` | Start the app in watch mode for local development. |
| `npm run start:debug` | Start the app in debug watch mode. |
| `npm run start:prod` | Run the compiled app from `dist/main`. |
| `npm run lint` | Run ESLint with auto-fix. |
| `npm run seed` | Seed demo data with `ts-node prisma/seed.ts`. |
| `npm run test` | Run unit tests. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run test:cov` | Run tests with coverage. |
| `npm run test:debug` | Run Jest in debug mode. |
| `npm run test:e2e` | Run e2e tests with `test/jest-e2e.json`. |

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Basic root response. |
| `GET` | `/health` | Public | Application and database health check. |

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | Register a new user. |
| `POST` | `/auth/login` | Public | Log in and receive access and refresh tokens. |
| `POST` | `/auth/refresh` | Public | Rotate refresh token and receive new tokens. |
| `POST` | `/auth/logout` | Public | Revoke the current refresh token. |
| `GET` | `/auth/profile` | Bearer token | Get the authenticated user's profile. |
| `PATCH` | `/auth/profile` | Bearer token | Update the authenticated user's profile. |
| `PATCH` | `/auth/change-password` | Bearer token | Change the authenticated user's password. |

### Products

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Public | List products with pagination, search, filters, and sorting. |
| `GET` | `/products/:id` | Public | Get a product by product `id`. This endpoint does not perform slug lookup. |
| `POST` | `/products` | Admin bearer token | Create a product. |
| `PATCH` | `/products/:id` | Admin bearer token | Update a product by product `id`. |
| `DELETE` | `/products/:id` | Admin bearer token | Delete a product by product `id`. |

Supported product query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Page number, default `1`. |
| `limit` | Page size from `1` to `100`, default `10`. |
| `search` | Case-insensitive search against product name and slug. |
| `categoryId` | Filter by category UUID. |
| `isActive` | Filter by active status using `true` or `false`. |
| `minPrice` | Minimum product price. |
| `maxPrice` | Maximum product price. |
| `sortBy` | Sort by `createdAt`, `price`, or `name`. |
| `sortOrder` | Sort direction: `asc` or `desc`. |

### Categories

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/categories` | Public | List categories with pagination, search, and sorting. |
| `GET` | `/categories/:id` | Public | Get a category by category `id`. |
| `POST` | `/categories` | Admin bearer token | Create a category. |
| `PATCH` | `/categories/:id` | Admin bearer token | Update a category by category `id`. |
| `DELETE` | `/categories/:id` | Admin bearer token | Delete a category by category `id`. |

Supported category query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Page number, default `1`. |
| `limit` | Page size from `1` to `100`, default `10`. |
| `search` | Search categories. |
| `sortBy` | Sort by `createdAt` or `name`. |
| `sortOrder` | Sort direction: `asc` or `desc`. |

### Cart

All cart routes require a Bearer access token.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/cart` | Bearer token | Get the authenticated user's cart with totals. |
| `POST` | `/cart/items` | Bearer token | Add a product to the authenticated user's cart. |
| `PATCH` | `/cart/items/:id` | Bearer token | Update a cart item quantity by cart item `id`. |
| `DELETE` | `/cart/items/:id` | Bearer token | Remove a cart item by cart item `id`. |
| `DELETE` | `/cart` | Bearer token | Clear the authenticated user's cart. |

### Orders

Order routes require a Bearer access token. Admin routes additionally require the `ADMIN` role.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/orders/checkout` | Bearer token | Create an order from the authenticated user's cart. |
| `GET` | `/orders` | Bearer token | List the authenticated user's orders. |
| `GET` | `/orders/:id` | Bearer token | Get one authenticated-user order by order `id`. |
| `PATCH` | `/orders/:id/cancel` | Bearer token | Cancel a pending authenticated-user order by order `id`. |
| `GET` | `/orders/admin/all` | Admin bearer token | List all orders. |
| `GET` | `/orders/admin/:id` | Admin bearer token | Get any order by order `id`. |
| `PATCH` | `/orders/admin/:id/status` | Admin bearer token | Update an order status by order `id`. |

Supported order query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Page number, default `1`. |
| `limit` | Page size from `1` to `100`, default `10`. |
| `status` | Filter by `PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, or `CANCELLED`. |
| `userId` | Admin listing filter by user UUID. |
| `fromDate` | Filter orders created after an ISO date. |
| `toDate` | Filter orders created before an ISO date. |
| `sortBy` | Sort by `createdAt`, `totalAmount`, or `status`. |
| `sortOrder` | Sort direction: `asc` or `desc`. |

### Users

All user management routes require an admin Bearer token.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users` | Admin bearer token | List users. |
| `GET` | `/users/:id` | Admin bearer token | Get a user by user `id`. |
| `PATCH` | `/users/:id/role` | Admin bearer token | Update a user's role. |
| `DELETE` | `/users/:id` | Admin bearer token | Delete a user by user `id`. |

## Swagger Documentation

Swagger/OpenAPI is configured in `src/main.ts` and served at:

```text
http://localhost:3000/api/docs
```

Swagger is configured with Bearer authentication. To test protected routes:

1. Start the backend with `npm run start:dev`.
2. Open `http://localhost:3000/api/docs`.
3. Use `POST /auth/login` with one of the seeded accounts.
4. Copy the returned `accessToken`.
5. Click **Authorize** and enter:

```text
Bearer <accessToken>
```

## Frontend Integration

This backend is designed to serve the Next.js frontend repository:

[https://github.com/supasentai/ecommerce-frontend-nextjs](https://github.com/supasentai/ecommerce-frontend-nextjs)

Local integration defaults:

| Service | URL |
| --- | --- |
| Backend API | `http://localhost:3000` |
| Frontend App | `http://localhost:3001` |
| Swagger UI | `http://localhost:3000/api/docs` |

CORS is configured in `src/main.ts` to allow requests from:

```text
http://localhost:3001
```

Allowed CORS methods:

```text
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Allowed headers:

```text
Content-Type, Authorization
```

## Production Deployment

The backend is deployed on Render and is consumed by the Vercel-hosted frontend.

### Production URLs

| Service      | URL                                                        |
| ------------ | ---------------------------------------------------------- |
| Backend API  | `https://ecommerce-backend-api-ikyj.onrender.com`          |
| Frontend App | `https://ecommerce-frontend-nextjs-peach.vercel.app`       |
| Swagger UI   | `https://ecommerce-backend-api-ikyj.onrender.com/api/docs` |

### Render Configuration

Recommended Render service settings:

```text
Runtime: Node
Branch: main
Build Command: npm install --include=dev && npx --no-install prisma generate && npm run build
Start Command: npx --no-install prisma migrate deploy && npm run start:prod
```

The project pins Node through `package.json`:

```json
"engines": {
  "node": "22.x",
  "npm": ">=10"
}
```

### Render Environment Variables

Required environment variables on Render:

```env
DATABASE_URL=<production_postgresql_connection_string>
JWT_SECRET=<production_jwt_secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://ecommerce-frontend-nextjs-peach.vercel.app
PORT=3000
```

`FRONTEND_URL` is used by CORS so the Vercel frontend can call the Render backend.

### Production Database

The production database is PostgreSQL.

To apply pending migrations during deployment, the Render start command runs:

```bash
npx --no-install prisma migrate deploy
```

To seed demo data manually, use the Render shell or a one-off command:

```bash
npm run seed
```

Seeded demo accounts:

| Role  | Email               | Password       |
| ----- | ------------------- | -------------- |
| Admin | `admin@example.com` | `Password123!` |
| User  | `user1@example.com` | `Password123!` |
| User  | `user2@example.com` | `Password123!` |

### Common Deployment Notes

* Do not commit `node_modules`.
* Commit both `package.json` and `package-lock.json` after changing dependencies.
* `@prisma/client` must be available as a runtime dependency.
* `prisma` is required during build/migration commands.
* If Render appears to use an old dependency tree, run **Manual Deploy → Clear build cache & deploy**.
* If CORS fails in production, verify that `FRONTEND_URL` exactly matches the Vercel production URL and does not include a trailing slash.

### Production Verification

After deployment, verify these endpoints:

```text
GET https://ecommerce-backend-api-ikyj.onrender.com/products
POST https://ecommerce-backend-api-ikyj.onrender.com/auth/login
GET https://ecommerce-backend-api-ikyj.onrender.com/api/docs
```

Example login request:

```bash
curl -X POST https://ecommerce-backend-api-ikyj.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"Password123!"}'
```


## Future Improvements

- Add product image upload/storage integration.
- Add stricter API response DTOs for public-facing resources.
- Add refresh-token device/session tracking.
- Add more e2e coverage for cart, checkout, and admin workflows.
- Add production deployment documentation.
- Add CI steps for Prisma migration checks.
- Add observability with structured logging and request tracing.

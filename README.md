# E-commerce API

Production-style REST API for an e-commerce backend built with NestJS, TypeScript, Prisma, and PostgreSQL. The project demonstrates practical backend engineering concerns: authentication, role-based access control, catalog management, cart workflows, checkout, order administration, stock handling, validation, error handling, and automated tests.

## Features

- User registration, login, profile update, and password change
- JWT authentication with protected routes
- Role-based access control for admin-only operations
- Admin user management
- Category and product CRUD
- Product listing with pagination and filters
- User cart management
- Checkout from cart with stock validation
- Order history and order detail endpoints
- Admin order management and status updates
- User order cancellation for pending orders
- Atomic stock decrement on checkout and stock restoration on cancellation
- Standard API response wrapping and centralized exception formatting
- Unit tests and e2e checkout flow test
- Swagger UI and Postman collection for API exploration

## Tech Stack

- Runtime: Node.js
- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Passport JWT, `@nestjs/jwt`
- Validation: class-validator, class-transformer
- Password hashing: bcrypt
- Testing: Jest, Supertest
- Local database: Docker Compose with PostgreSQL
- API documentation: Swagger/OpenAPI

## Architecture

The application follows a modular NestJS architecture:

- Controllers define HTTP routes and apply guards.
- Services contain business logic and Prisma data access.
- DTOs validate and document request payloads/query parameters.
- Guards enforce JWT authentication and role-based authorization.
- Common filters/interceptors provide consistent error and success responses.
- Prisma owns the database schema and migrations.

Key modules:

- `AuthModule`: registration, login, JWT profile, profile update, password changes
- `UsersModule`: admin user listing, lookup, role update, deletion
- `CategoriesModule`: category CRUD
- `ProductsModule`: product CRUD and public listing
- `CartModule`: current user's cart and cart item operations
- `OrdersModule`: checkout, user order history, cancellation, admin order management

## Database Schema Overview

The Prisma schema models the core e-commerce domain:

- `User`: account, password hash, role, cart items, orders
- `Category`: product grouping with unique slug
- `Product`: catalog item with price, stock, active flag, and category
- `CartItem`: user/product pair with quantity
- `Order`: user order with status and total amount
- `OrderItem`: order line item with quantity and snapshot price

Enums:

- `Role`: `USER`, `ADMIN`
- `OrderStatus`: `PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`

ERD assets:

- [Mermaid ERD source](docs/ecommerce-erd.mmd)
- [SVG ERD diagram](docs/ecommerce-erd.svg)

![E-commerce API ERD](docs/ecommerce-erd.svg)

## Installation

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

## Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

## Running Locally

Start PostgreSQL:

```bash
docker compose up -d
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the API in development mode:

```bash
npm run start:dev
```

The API runs at:

```text
http://localhost:3000
```

## Docker Setup

This repository includes a `docker-compose.yml` for local PostgreSQL:

```bash
docker compose up -d
```

It starts:

- PostgreSQL 16 Alpine
- Database: `ecommerce_db`
- User/password: `postgres` / `postgres`
- Host port: `5432`

To stop the database:

```bash
docker compose down
```

To remove the database volume:

```bash
docker compose down -v
```

## Running Tests

Run unit tests:

```bash
npm test
```

Run e2e tests:

```bash
npm run test:e2e
```

Run build:

```bash
npm run build
```

## API Documentation

Swagger UI is available after starting the application:

```text
http://localhost:3000/api/docs
```

The Swagger document includes tags for:

- Auth
- Users
- Categories
- Products
- Cart
- Orders

Bearer authentication is configured in Swagger. Log in through `POST /auth/login`, copy the `accessToken`, then authorize with:

```text
Bearer <accessToken>
```

## Postman Collection

A Postman collection is included at:

```text
docs/ecommerce-api.postman_collection.json
```

Collection variables:

- `baseUrl`: default `http://localhost:3000`
- `token`: regular user JWT
- `adminToken`: admin JWT
- `userId`, `categoryId`, `productId`, `cartItemId`, `orderId`: resource IDs used across requests

The collection is organized into:

- Auth
- Users
- Categories
- Products
- Cart
- Orders
- Admin Orders

## Folder Structure

```text
ecommerce-api/
├── docs/
│   ├── ecommerce-api.postman_collection.json
│   ├── ecommerce-erd.mmd
│   └── ecommerce-erd.svg
├── prisma/
│   └── schema.prisma
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   ├── modules/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── products/
│   │   └── users/
│   ├── prisma/
│   ├── app.module.ts
│   └── main.ts
├── test/
│   └── app.e2e-spec.ts
├── docker-compose.yml
├── package.json
└── README.md
```

## Core API Flow

1. Register or log in as a user.
2. Browse categories/products.
3. Add active products to cart.
4. Checkout cart to create a pending order.
5. View order history and order details.
6. Cancel a pending order to restore stock.
7. Use an admin account to manage users, catalog data, and order status.

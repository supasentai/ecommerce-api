# E-commerce API

Backend learning project for internship preparation.

This repository is built as a step-by-step backend project to prepare for a Backend / Software Engineer Intern position.

## Goal

Build a production-style E-commerce REST API with:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Role-based Authorization
- Docker
- Swagger API Documentation
- Unit and Integration Testing

## Why this project matters for internship

This project is designed to show practical backend engineering skills, not only coding syntax.

It focuses on:

- REST API design
- Database schema design
- Authentication and authorization
- Clean project structure
- Validation and error handling
- Docker-based development environment
- Testing mindset
- Git workflow with issues and branches

## Planned Features

### Core Modules

- Auth
- Users
- Products
- Categories
- Cart
- Orders
- Reviews

### Technical Features

- JWT login and registration
- Password hashing
- Role-based access control: Admin and User
- PostgreSQL database
- Prisma migrations
- Swagger documentation
- Docker Compose setup
- Unit tests
- Integration tests

## Learning Roadmap

### Phase 1: Project Setup

- Initialize NestJS project
- Configure TypeScript and environment variables
- Setup basic folder structure
- Add Git workflow rules

### Phase 2: Database Foundation

- Design database schema
- Setup PostgreSQL
- Setup Prisma
- Create first migration

### Phase 3: Product CRUD

- Create Product module
- Implement CRUD API
- Add DTO validation
- Add error handling
- Document endpoints with Swagger

### Phase 4: Authentication

- Register user
- Login user
- Hash password
- Generate JWT access token
- Protect private routes

### Phase 5: Authorization

- Add user roles
- Protect admin-only routes
- Apply guards

### Phase 6: E-commerce Business Logic

- Cart module
- Order module
- Review module
- Stock update logic

### Phase 7: Docker and Deployment Preparation

- Dockerfile
- docker-compose.yml
- Run API and PostgreSQL with Docker
- Prepare production environment variables

### Phase 8: Testing and CV Polish

- Unit tests
- Integration tests
- API examples
- Architecture diagram
- Final README polish

## Git Workflow

Branch naming:

```bash
feature/task-<id>-<short-name>
```

Example:

```bash
feature/task-1-project-setup
```

Commit format:

```bash
[Task-1] Initialize NestJS project structure
```

## Definition of Done

A task is done only when:

- The code runs locally.
- The README or docs are updated if needed.
- The branch is committed with the correct commit message.
- The pull request or merge summary explains what changed.
- Any new concept learned is noted for interview preparation.

## Current Status

Project just started.

Next step: complete Task 1 - Initialize NestJS project and basic repository structure.

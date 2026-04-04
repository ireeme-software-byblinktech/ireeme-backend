# Blink Campus — Backend API

School management platform backend. Built with NestJS, PostgreSQL, Redis, Prisma, and BullMQ.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| NestJS + TypeScript | API framework |
| PostgreSQL 16 | Primary database |
| Prisma ORM | Type-safe DB access + migrations |
| Redis 7 | Caching, rate limiting, token blacklist |
| BullMQ | Background job queues |
| MinIO | Local S3-compatible file storage (dev) |
| MailHog | Local SMTP email catcher (dev) |
| JWT + bcrypt | Auth — access (15m) + refresh (7d) tokens |
| Helmet + Throttler | Security headers + rate limiting |
| Swagger | Auto-generated API docs at `/api/docs` |
| Winston | Structured JSON logging |
| Docker Compose | One-command local environment |

---

## Prerequisites

- Node.js 20+
- Docker Desktop running
- npm

---

## First-Time Setup

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Create your `.env` file

Copy the example and fill in values (defaults work for local dev out of the box):

```bash
cp .env.example .env
```

The `.env` already has working local values. The only thing you may want to change is the JWT secrets for your own dev environment. Everything else connects to the Docker containers.

### 3. Start all infrastructure containers

```bash
docker-compose up -d
```

This starts:

| Container | Port | Purpose |
|---|---|---|
| `blink-postgres` | `5432` | PostgreSQL database |
| `blink-redis` | `6379` | Redis |
| `blink-pgadmin` | `5050` | pgAdmin web UI |
| `blink-minio` | `9000` (API) / `9001` (console) | Local S3 storage |
| `blink-mailhog` | `1025` (SMTP) / `8025` (inbox UI) | Email catcher |

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

When prompted for a migration name, enter something like `init`.

### 6. Seed the super admin

```bash
npm run db:seed
```

This creates the super admin account using `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` from your `.env`.

### 7. Create the MinIO bucket

1. Open `http://localhost:9001`
2. Log in: username `blink_minio_key`, password `blink_minio_secret_2025`
3. Create a bucket named `blink-campus-files`

### 8. Start the API server

```bash
npm run dev
```

The API is now running at `http://localhost:3000/api/v1`

Swagger docs: `http://localhost:3000/api/docs`

---

## Environment Variables

All variables live in `.env`. Never commit this file — it is in `.gitignore`.

```env
# App
NODE_ENV=development
PORT=3000
APP_NAME=BlinkCampusAPI
API_VERSION=v1

# Database
DATABASE_URL="postgresql://blink_admin:Blink@2025Secure!@localhost:5432/blink_campus_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=                          # leave blank for local dev

# JWT — use long random strings in production
JWT_ACCESS_SECRET=super-secret-access-key-change-in-production-2025
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production-2025
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS S3 / MinIO
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=blink_minio_key
AWS_SECRET_ACCESS_KEY=blink_minio_secret_2025
AWS_S3_BUCKET_NAME=blink-campus-files
AWS_S3_BUCKET_REGION=us-east-1
AWS_ENDPOINT=http://localhost:9000       # remove this in production

MINIO_ROOT_USER=blink_minio_key
MINIO_ROOT_PASSWORD=blink_minio_secret_2025

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60                        # seconds
RATE_LIMIT_MAX=300                       # requests per window

# Email
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@blinkcampus.com

# Seed admin
SUPER_ADMIN_EMAIL=admin@blinkcampus.com
SUPER_ADMIN_PASSWORD=Admin@2025
```

---

## NPM Scripts

```bash
npm run dev           # Start in watch mode (development)
npm run build         # Compile TypeScript to dist/
npm run start         # Run compiled build (production)
npm run db:generate   # Generate Prisma client from schema
npm run db:migrate    # Run pending migrations (dev)
npm run db:seed       # Seed super admin account
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run lint          # ESLint with auto-fix
npm run test:run      # Run all tests once (no watch)
```

---

## Project Structure

```
src/
├── main.ts                        # Bootstrap — Swagger, Helmet, global pipes
├── app.module.ts                  # Root module — wires everything
├── config/
│   ├── config.module.ts           # Joi-validated env vars
│   ├── redis.module.ts            # Global Redis client
│   └── winston.config.ts          # Structured JSON logging
├── database/
│   ├── prisma.service.ts          # PrismaClient singleton
│   └── base.repository.ts         # BaseRepository — enforces schoolId scoping
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── global-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── middleware/
│       └── tenant.middleware.ts   # Injects schoolId from JWT into request
└── modules/
    ├── auth/                      # Login, refresh, logout, /me
    ├── users/                     # User creation with roles
    ├── schools/                   # School CRUD (Super Admin)
    ├── students/                  # Student CRUD + dashboard
    ├── teachers/                  # Teacher CRUD + subject assignment
    ├── classes/                   # Class CRUD with roster
    ├── subjects/                  # Subject CRUD
    ├── academic-terms/            # Term management + active term
    ├── timetable/                 # Timetable slots per class/teacher
    ├── assignments/               # Assignment CRUD + student submission
    ├── grades/                    # Grading + GPA + appeals
    └── attendance/                # Bulk attendance marking + analytics
```

---

## API Overview

Base URL: `http://localhost:3000/api/v1`

All endpoints (except `/auth/login` and `/auth/refresh`) require:
```
Authorization: Bearer <accessToken>
```

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns `accessToken` + sets `refresh_token` cookie |
| POST | `/auth/refresh` | Public | Rotates refresh token |
| POST | `/auth/logout` | Any | Blacklists token in Redis |
| GET | `/auth/me` | Any | Current user from JWT |

### Schools

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/schools` | SUPER_ADMIN | List all schools |
| POST | `/schools` | SUPER_ADMIN | Create school |
| GET | `/schools/:id` | SUPER_ADMIN, SCHOOL_ADMIN | Get school |

### Students

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/students` | SCHOOL_ADMIN, TEACHER | Paginated list (school-scoped) |
| POST | `/students` | SCHOOL_ADMIN | Create student + user account |
| GET | `/students/:id` | SCHOOL_ADMIN, TEACHER | Full profile |
| PATCH | `/students/:id` | SCHOOL_ADMIN | Update profile |
| GET | `/students/:id/dashboard` | STUDENT | Aggregated dashboard (cached 5 min) |

### Teachers

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/teachers` | SCHOOL_ADMIN | List teachers |
| POST | `/teachers` | SCHOOL_ADMIN | Create teacher + user account |
| GET | `/teachers/:id` | SCHOOL_ADMIN, TEACHER | Profile + subjects |
| PATCH | `/teachers/:id` | SCHOOL_ADMIN | Update profile |
| POST | `/teachers/:id/subjects/:subjectId` | SCHOOL_ADMIN | Assign subject |
| DELETE | `/teachers/:id/subjects/:subjectId` | SCHOOL_ADMIN | Remove subject |

### Classes

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/classes` | SCHOOL_ADMIN, TEACHER | List all classes |
| POST | `/classes` | SCHOOL_ADMIN | Create class |
| GET | `/classes/:id` | SCHOOL_ADMIN, TEACHER | Class with roster + timetable |
| PATCH | `/classes/:id` | SCHOOL_ADMIN | Update class |

### Subjects

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/subjects` | Any | List (filter by `?classId=`) |
| POST | `/subjects` | SCHOOL_ADMIN | Create subject |
| GET | `/subjects/:id` | Any | Get subject |
| PATCH | `/subjects/:id` | SCHOOL_ADMIN | Update subject |

### Academic Terms

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/academic-terms` | Any | List all terms |
| GET | `/academic-terms/active` | Any | Current active term |
| POST | `/academic-terms` | SCHOOL_ADMIN | Create term (sets active if flagged) |
| PATCH | `/academic-terms/:id` | SCHOOL_ADMIN | Update term |

### Timetable

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/timetable/class/:classId` | Any | Timetable for a class |
| GET | `/timetable/teacher/:teacherId` | Any | Timetable for a teacher |
| POST | `/timetable` | SCHOOL_ADMIN | Create slot |
| DELETE | `/timetable/:id` | SCHOOL_ADMIN | Delete slot |

### Assignments

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/assignments` | Any | List (filter by `?subjectId=` or `?teacherId=`) |
| POST | `/assignments` | TEACHER | Create assignment |
| GET | `/assignments/:id` | Any | Get with submissions |
| PATCH | `/assignments/:id` | TEACHER | Update |
| POST | `/assignments/:id/submit` | STUDENT | Submit files |

### Grades

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| PATCH | `/grades/submissions/:submissionId/grade` | TEACHER | Post score + feedback |
| GET | `/grades/student/:studentId/:termId` | STUDENT, PARENT, ADMIN, TEACHER | Grades + GPA |
| POST | `/grades/:id/appeal` | STUDENT | Submit appeal |
| PATCH | `/grades/:id/appeal/:status` | TEACHER | Resolve appeal |

---

## Authentication Flow

```
POST /auth/login  →  { accessToken }  +  refresh_token (httpOnly cookie)
                          ↓ (expires in 15m)
POST /auth/refresh  →  new { accessToken }  +  new refresh_token cookie
                          ↓ (when done)
POST /auth/logout  →  blacklists JTI in Redis, clears cookie
```

Access tokens are short-lived (15 min). Refresh tokens last 7 days and are stored as bcrypt hashes in the database. On logout, the access token's JTI is stored in Redis with a TTL equal to its remaining lifetime.

---

## Multi-Tenancy (School Isolation)

Every request is automatically scoped to the user's school:

1. `TenantMiddleware` extracts `schoolId` from the JWT and attaches it to the request
2. Every repository extends `BaseRepository` which has a `scopeToSchool()` helper
3. All Prisma queries include `where: { schoolId }` — a student from School A can never see School B data
4. Wrong school data returns `404`, not `403` — to avoid leaking that the resource exists

---

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /auth/login` | 10 attempts | 15 min (then IP locked) |
| All other endpoints | 300 requests | 60 seconds |

Limits are enforced via Redis and configured through `RATE_LIMIT_TTL` and `RATE_LIMIT_MAX` in `.env`.

---

## Dev Tools

| Tool | URL | Credentials |
|---|---|---|
| Swagger API Docs | http://localhost:3000/api/docs | — |
| pgAdmin | http://localhost:5050 | `admin@blink.dev` / `admin` |
| MinIO Console | http://localhost:9001 | `blink_minio_key` / `blink_minio_secret_2025` |
| MailHog Inbox | http://localhost:8025 | — |
| Prisma Studio | run `npm run db:studio` | — |

---

## Docker Commands

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# View logs for a specific container
docker-compose logs -f blink-redis
docker-compose logs -f blink-postgres

# Restart a single container
docker-compose restart blink-redis

# Wipe everything including volumes (full reset)
docker-compose down -v
```

---

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply a new migration
npm run db:migrate

# Open visual database browser
npm run db:studio

# Reset DB and re-run all migrations (destructive)
npx prisma migrate reset
```

---

## Logs

Winston writes structured JSON logs to:
- `logs/combined.log` — all levels
- `logs/error.log` — errors only
- Console — pretty-printed in development

---

## Security Notes

- Never commit `.env` — it is in `.gitignore`
- JWT secrets must be at least 32 characters
- `AWS_ENDPOINT` must be removed when deploying to production (so the SDK uses real AWS)
- `BCRYPT_ROUNDS=12` is the minimum recommended for production
- All file uploads should be renamed to UUIDs before storage (never use original filenames)

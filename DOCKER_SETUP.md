# Docker Setup Guide

## Issue: Request Timeout Exception

If you see this error:
```
RequestTimeoutException: Request timeout exceeded
```

It means the backend is trying to connect to services (Redis, PostgreSQL, etc.) that are not running.

## Solution: Start Docker Services

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your Windows machine.

### 2. Start All Services
```bash
cd iremee-backend
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432) - Database
- **Redis** (port 6379) - Caching & WebSocket adapter
- **MinIO** (ports 9000, 9001) - File storage (S3-compatible)
- **MailHog** (ports 1025, 8025) - Email testing
- **pgAdmin** (port 5050) - Database management UI

### 3. Verify Services Are Running
```bash
docker ps
```

You should see containers running:
- `blink-postgres`
- `blink-redis`
- `blink-minio`
- `blink-mailhog`
- `blink-pgadmin`

### 4. Check Service Health
```bash
# Check Redis
docker exec blink-redis redis-cli ping
# Should return: PONG

# Check PostgreSQL
docker exec blink-postgres pg_isready
# Should return: accepting connections
```

### 5. Run Database Migrations
```bash
npm run db:migrate
```

### 6. Seed the Database
```bash
npm run db:seed
```

### 7. Start the Backend
```bash
npm run start:dev
```

## Quick Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
```

### Restart a specific service
```bash
docker-compose restart redis
docker-compose restart postgres
```

## Service URLs

- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **pgAdmin**: http://localhost:5050 (admin@blink.dev / admin)
- **MinIO Console**: http://localhost:9001 (blink_minio_key / blink_minio_secret_2025)
- **MailHog UI**: http://localhost:8025

## Troubleshooting

### Docker Desktop Won't Start
If you see "WSL update required":
1. Update WSL: `wsl --update`
2. Restart Docker Desktop

### Port Already in Use
If a port is already taken:
```bash
# Find what's using the port (e.g., 6379 for Redis)
netstat -ano | findstr :6379

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Reset Everything
If you need to start fresh:
```bash
# Stop and remove all containers, volumes, and data
docker-compose down -v

# Start fresh
docker-compose up -d
npm run db:migrate
npm run db:seed
```

## Running Without Docker (Not Recommended)

If you want to run without Docker, you'll need to:
1. Install PostgreSQL locally
2. Install Redis locally
3. Update `.env` with local connection strings
4. Comment out or disable services that require Docker (MinIO, MailHog)

This is not recommended for development as Docker provides a consistent environment.

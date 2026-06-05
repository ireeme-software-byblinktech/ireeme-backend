# PowerShell startup script for Windows

Write-Host "🚀 Starting Blink Academy Backend..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Start Docker services
Write-Host "📦 Starting Docker services..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if services are running
Write-Host ""
Write-Host "🔍 Checking services..." -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "blink"

Write-Host ""
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Service URLs:" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:3001"
Write-Host "   - Swagger Docs: http://localhost:3001/api/docs"
Write-Host "   - pgAdmin: http://localhost:5050"
Write-Host "   - MinIO Console: http://localhost:9001"
Write-Host "   - MailHog UI: http://localhost:8025"
Write-Host ""
Write-Host "🔐 Admin Login:" -ForegroundColor Cyan
Write-Host "   - Email: admin@gmail.com"
Write-Host "   - Password: admin@123"
Write-Host ""
Write-Host "🎯 Starting backend server..." -ForegroundColor Cyan
npm run start:dev

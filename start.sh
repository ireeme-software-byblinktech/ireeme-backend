#!/bin/bash

echo "🚀 Starting Blink Academy Backend..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start Docker services
echo "📦 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo ""
echo "🔍 Checking services..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep blink

echo ""
echo "✅ All services started!"
echo ""
echo "📚 Service URLs:"
echo "   - Backend API: http://localhost:3001"
echo "   - Swagger Docs: http://localhost:3001/api/docs"
echo "   - pgAdmin: http://localhost:5050"
echo "   - MinIO Console: http://localhost:9001"
echo "   - MailHog UI: http://localhost:8025"
echo ""
echo "🔐 Admin Login:"
echo "   - Email: admin@gmail.com"
echo "   - Password: admin@123"
echo ""
echo "🎯 Starting backend server..."
npm run start:dev

#!/bin/bash

# Algonix Deployment Script
echo "🚀 Starting Algonix deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads ssl

# Copy environment file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration before continuing."
    echo "   Required: MONGODB_URI, JWT_SECRET, RAPIDAPI_KEY"
    read -p "Press Enter after configuring the environment file..."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost"
    echo "   API: http://localhost/api"
    echo "   Health Check: http://localhost/health"
    echo ""
    echo "📊 Default Admin Account:"
    echo "   Email: admin@algonix.com"
    echo "   Password: admin123"
    echo "   (Please change this after first login)"
    echo ""
    echo "🎉 Deployment completed successfully!"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
fi

# Show logs
echo ""
echo "📋 Recent logs:"
docker-compose logs --tail=20
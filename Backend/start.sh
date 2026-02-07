#!/bin/bash

# Quick Start Script for Microservices
# This script helps you get started quickly

echo "╔════════════════════════════════════════════════════╗"
echo "║   Microservices Docker Setup - Quick Start        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo ""
    echo "Please create a .env file from .env.example:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env with your actual credentials."
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if PostgreSQL is accessible
echo "🔍 Checking PostgreSQL connection..."
DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
DB_PASS=$(grep DB_PASS .env | cut -d '=' -f2)

if [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
    echo "⚠️  Warning: DB credentials not set in .env"
else
    echo "✅ Database credentials found"
fi

echo ""
echo "🚀 Starting all microservices..."
echo ""
echo "This will:"
echo "  1. Build all Docker images (first time takes 5-10 minutes)"
echo "  2. Start Eureka Server"
echo "  3. Start API Gateway"
echo "  4. Start all microservices"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Building and starting services..."
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 30

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Services are starting!"
echo ""
echo "🔗 Important URLs:"
echo "   Eureka Dashboard: http://localhost:8761"
echo "   API Gateway:      http://localhost:8080"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""
echo "Happy coding! 🚀"

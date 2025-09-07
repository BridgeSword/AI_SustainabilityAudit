#!/bin/bash

# SMARAG Project Quick Start Script
# This script provides the fastest way to start the project for returning users

echo "⚡ SMARAG Quick Start"
echo "===================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if services are already running
if lsof -i :5173 > /dev/null 2>&1 && lsof -i :9092 > /dev/null 2>&1; then
    echo "🎉 Services appear to be already running!"
    echo ""
    echo "🌐 Access URLs:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend: http://localhost:9092"
    echo ""
    echo "Run './verify.sh' to check all services"
    echo "Run './stop.sh' to stop all services"
    exit 0
fi

print_status "Starting all services..."

# Start all services
./start.sh

print_success "Quick start completed!"
echo ""
echo "🚀 Your SMARAG project is ready!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:9092"

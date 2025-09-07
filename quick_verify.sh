#!/bin/bash

# SMARAG Project Quick Verification Script
# Fast status check without detailed connectivity tests

echo "⚡ SMARAG Quick Status Check"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Quick port checks
echo ""
print_status "Quick Port Check..."
echo "-------------------"

# Check ports quickly
ports=("11434:Ollama" "9092:Backend" "5173:Frontend" "3000:Milvus Attu" "5555:Flower" "27017:MongoDB" "19530:Milvus" "6379:Redis")

running_count=0
total_count=${#ports[@]}

for port_info in "${ports[@]}"; do
    port=$(echo $port_info | cut -d: -f1)
    service=$(echo $port_info | cut -d: -f2)
    
    if lsof -i :$port > /dev/null 2>&1; then
        print_success "$service (port $port)"
        running_count=$((running_count + 1))
    else
        print_error "$service (port $port)"
    fi
done

echo ""
print_status "Quick Summary..."
echo "=================="
echo "Running services: $running_count/$total_count"

if [ $running_count -eq $total_count ]; then
    print_success "All services are running! 🎉"
    echo ""
    echo "🌐 Quick Access:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend: http://localhost:9092"
    echo "  Milvus Attu: http://localhost:3000"
    echo "  Flower: http://localhost:5555"
else
    print_error "Some services are not running"
    echo ""
    echo "💡 Run './start.sh' to start missing services"
    echo "💡 Run './verify.sh' for detailed diagnostics"
fi

echo ""
echo "==========================="


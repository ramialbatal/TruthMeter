#!/bin/bash

# TruthMeter Backend Server
# Starts only the backend server

echo "🔧 Starting TruthMeter Backend..."
echo ""

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "⚠️  Backend dependencies not installed!"
    echo "Please run ./clean-install.sh first"
    exit 1
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env file not found!"
    echo "Please create backend/.env with your API keys"
    exit 1
fi

cd backend
npm run dev

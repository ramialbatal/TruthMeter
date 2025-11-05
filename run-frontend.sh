#!/bin/bash

# TruthMeter Frontend Server
# Starts only the frontend server

echo "🎨 Starting TruthMeter Frontend..."
echo ""

# Check if node_modules exist
if [ ! -d "frontend/node_modules" ]; then
    echo "⚠️  Frontend dependencies not installed!"
    echo "Please run ./clean-install.sh first"
    exit 1
fi

cd frontend
npm run dev

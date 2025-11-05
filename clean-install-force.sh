#!/bin/bash

# TruthMeter Clean Install Script (Force mode - no prompts)
# This script removes EVERYTHING including the database and reinstalls

set -e  # Exit on error

echo "🧹 TruthMeter Clean Install (Force Mode)"
echo "========================================"
echo "⚠️  This will remove ALL data including the database!"
echo ""

echo "Cleaning frontend..."
rm -rf frontend/node_modules
rm -rf frontend/dist
rm -f frontend/package-lock.json
echo "✓ Frontend cleaned"

echo ""
echo "Cleaning backend..."
rm -rf backend/node_modules
rm -rf backend/dist
rm -f backend/package-lock.json
rm -f backend/truthmeter.db
echo "✓ Backend cleaned"

echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✓ Backend dependencies installed"

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✓ Frontend dependencies installed"

echo ""
echo "✅ Clean install complete!"
echo ""
echo "To run the application:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""

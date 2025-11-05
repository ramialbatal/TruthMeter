#!/bin/bash

# TruthMeter Clean Install Script
# This script removes all dependencies and build artifacts, then reinstalls everything

set -e  # Exit on error

echo "🧹 TruthMeter Clean Install Script"
echo "=================================="
echo ""

# Ask about database
read -p "Do you want to remove the database (truthmeter.db)? (y/N): " -n 1 -r
echo ""
REMOVE_DB=$REPLY

echo ""
echo "Step 1: Cleaning frontend..."
rm -rf frontend/node_modules
rm -rf frontend/dist
rm -f frontend/package-lock.json
echo "✓ Frontend cleaned"

echo ""
echo "Step 2: Cleaning backend..."
rm -rf backend/node_modules
rm -rf backend/dist
rm -f backend/package-lock.json
echo "✓ Backend cleaned"

if [[ $REMOVE_DB =~ ^[Yy]$ ]]; then
    echo ""
    echo "Step 3: Removing database..."
    rm -f backend/truthmeter.db
    echo "✓ Database removed"
fi

echo ""
echo "Step 4: Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✓ Backend dependencies installed"

echo ""
echo "Step 5: Installing frontend dependencies..."
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

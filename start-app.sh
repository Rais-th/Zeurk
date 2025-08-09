#!/bin/bash

# Zeurk App Startup Script
# This script handles common startup issues automatically

echo "🚀 Starting Zeurk App..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your environment variables."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dotenv is installed (common issue)
if ! npm list dotenv > /dev/null 2>&1; then
    echo "📦 Installing missing dotenv dependency..."
    npm install dotenv
fi

# Clear any potential cache issues
echo "🧹 Clearing caches..."
npm cache clean --force > /dev/null 2>&1

# Kill any existing Metro processes on port 8081
echo "🔄 Checking for existing Metro processes..."
lsof -ti:8081 | xargs kill -9 > /dev/null 2>&1 || true

# Start the app
echo "✅ Starting Expo development server..."
npx expo start --clear

echo "🎉 App should be running at http://localhost:8081"
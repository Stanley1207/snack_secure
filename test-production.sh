#!/bin/bash

# Test Production Build Script
# This script builds and runs SnackSecure in production mode locally

set -e

echo "🔨 Building client and server..."
npm run build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🚀 Starting server in production mode..."
echo "   Server will run on http://localhost:3001"
echo ""
echo "⚠️  Make sure you have set these environment variables:"
echo "   - JWT_SECRET (or it will use 'test-secret')"
echo "   - GOOGLE_GEMINI_API_KEY (required for AI analysis)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd server
NODE_ENV=production \
  PORT=3001 \
  JWT_SECRET="${JWT_SECRET:-test-secret}" \
  GOOGLE_GEMINI_API_KEY="${GOOGLE_GEMINI_API_KEY}" \
  npm start

#!/bin/bash
# Build script for Render

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies and build
cd ../frontend
npm install
npm run build

# Copy build to backend
cp -r build ../backend/

echo "Build completed successfully!"
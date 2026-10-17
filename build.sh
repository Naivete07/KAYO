#!/usr/bin/env bash
# Exit on error
set -o errexit

echo ">>> [1/3] Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ">>> [2/3] Installing Node.js frontend dependencies..."
cd frontend
npm install

echo ">>> [3/3] Compiling React production bundle..."
npm run build
cd ..

echo ">>> Deployment build completed successfully!"

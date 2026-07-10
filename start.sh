#!/bin/bash

echo "🎵 Room Acoustics Simulator - Quick Start"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✓ Python and Node.js are installed"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt --quiet

echo "✓ Backend setup complete"
echo ""

# Start backend in background
echo "🚀 Starting Flask backend on http://localhost:5000..."
python app.py &
BACKEND_PID=$!

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies (this may take a few minutes)..."
    npm install --silent
fi

echo "✓ Frontend setup complete"
echo ""

# Start frontend
echo "🚀 Starting React frontend on http://localhost:3000..."
echo ""
echo "=========================================="
echo "✨ Application is starting!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Trap Ctrl+C to cleanup
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID; exit" INT

npm start

# Cleanup
kill $BACKEND_PID

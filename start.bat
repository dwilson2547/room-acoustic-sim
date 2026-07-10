@echo off
echo.
echo Room Acoustics Simulator - Quick Start
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo Python and Node.js are installed
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt --quiet

echo Backend setup complete
echo.

REM Start backend in new window
echo Starting Flask backend on http://localhost:5000...
start "Backend - Flask" cmd /k "cd /d %CD% && venv\Scripts\activate.bat && python app.py"

cd ..

REM Frontend setup
echo Setting up frontend...
cd frontend

if not exist "node_modules" (
    echo Installing Node dependencies (this may take a few minutes)...
    call npm install
)

echo Frontend setup complete
echo.

REM Start frontend
echo Starting React frontend on http://localhost:3000...
echo.
echo ==========================================
echo Application is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ==========================================
echo.
echo Close the backend window to stop the Flask server
echo Press Ctrl+C here to stop the React development server
echo.

npm start

pause

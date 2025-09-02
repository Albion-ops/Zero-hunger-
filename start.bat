@echo off
REM Zero Hunger System Startup Script for Windows

echo 🌱 Starting Zero Hunger System...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from template...
    if exist env.template (
        copy env.template .env
        echo ✅ Created .env file from template
        echo 📝 Please edit .env file with your database credentials before running again
        pause
        exit /b 1
    ) else (
        echo ❌ env.template not found. Please create .env file manually
        pause
        exit /b 1
    )
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

echo 🚀 Starting server...
npm start

pause

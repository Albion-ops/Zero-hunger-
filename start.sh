#!/bin/bash

# Zero Hunger System Startup Script

echo "🌱 Starting Zero Hunger System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "✅ Created .env file from template"
        echo "📝 Please edit .env file with your database credentials before running again"
        exit 1
    else
        echo "❌ env.template not found. Please create .env file manually"
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if database is accessible (basic check)
echo "🔍 Checking database connection..."
node -e "
const mysql = require('mysql');
require('dotenv').config();
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'zerohunger_db',
  port: parseInt(process.env.MYSQL_PORT || '3306')
});
pool.getConnection((err, connection) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    console.log('💡 Please check your database configuration in .env file');
    process.exit(1);
  }
  console.log('✅ Database connection successful');
  connection.release();
  process.exit(0);
});
" || exit 1

echo "🚀 Starting server..."
npm start

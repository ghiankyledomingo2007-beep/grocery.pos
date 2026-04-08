@echo off
echo ========================================
echo   POS System - Quick Setup (SQLite)
echo ========================================
echo.

echo Step 1: Updating database to SQLite...
powershell -Command "(Get-Content prisma\schema.prisma) -replace 'provider = \"postgresql\"', 'provider = \"sqlite\"' | Set-Content prisma\schema.prisma"

echo Step 2: Updating .env file...
echo DATABASE_URL="file:./dev.db" > .env
echo NEXTAUTH_SECRET="pos-secret-key-change-in-production" >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env

echo Step 3: Generating Prisma client...
call npx prisma generate

echo Step 4: Creating database...
call npx prisma migrate dev --name init

echo Step 5: Seeding database with sample data...
call npm run db:seed

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Login credentials:
echo   Email: admin@store.com
echo   Password: admin123
echo.
echo Starting development server...
echo Open http://localhost:3000 in your browser
echo.
call npm run dev

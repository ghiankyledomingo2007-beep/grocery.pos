# Quick Setup Guide

## Option 1: Use SQLite (Easiest - No PostgreSQL needed)

1. **Update `.env` file:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
```

2. **Update `prisma/schema.prisma`:**
Change line 7 from:
```prisma
provider = "postgresql"
```
to:
```prisma
provider = "sqlite"
```

3. **Run setup:**
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Option 2: Use PostgreSQL (Production-ready)

1. **Install PostgreSQL:**
   - Download from https://www.postgresql.org/download/

2. **Create database:**
```bash
psql -U postgres
CREATE DATABASE pos_db;
\q
```

3. **Update `.env` with your password:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pos_db?schema=public"
```

4. **Run setup:**
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Login

Open http://localhost:3000

- Email: `admin@store.com`
- Password: `admin123`

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env
- Try SQLite option instead

### "Module not found"
```bash
npm install
npx prisma generate
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Next Steps

1. ✅ Login with admin account
2. ✅ Try searching for products
3. ✅ Add items to cart
4. ✅ Complete a sale
5. 📊 Check Prisma Studio: `npx prisma studio`

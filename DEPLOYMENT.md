# Production Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code

1. Make sure all changes are committed to Git:
```bash
git add .
git commit -m "Ready for production"
git push
```

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
DATABASE_URL = postgresql://user:password@host:5432/database
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
NEXTAUTH_URL = https://your-app.vercel.app
```

### Step 4: Add PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. In your Vercel project, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Copy the DATABASE_URL to environment variables

**Option B: Railway**
1. Go to https://railway.app
2. Create new project → "Provision PostgreSQL"
3. Copy connection string to Vercel environment variables

### Step 5: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Run migrations:
   - Go to Vercel dashboard → Settings → Functions
   - Or use Vercel CLI: `vercel env pull && npx prisma migrate deploy`

### Step 6: Seed Production Database

```bash
# Install Vercel CLI
npm install -g vercel

# Pull environment variables
vercel env pull

# Run seed script
npm run db:seed
```

---

## 🚂 Alternative: Deploy to Railway

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository

### Step 3: Add PostgreSQL

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically set DATABASE_URL

### Step 4: Add Environment Variables

In Railway dashboard, add:

```
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
NEXTAUTH_URL = https://your-app.railway.app
```

### Step 5: Configure Build

Railway will auto-detect Next.js. If needed, set:
- Build Command: `prisma generate && npm run build`
- Start Command: `npm start`

### Step 6: Deploy

1. Railway will auto-deploy on push
2. Get your public URL from dashboard
3. Update NEXTAUTH_URL with your Railway URL

---

## 🔐 Generate Secure Secret

Run this command to generate a secure NEXTAUTH_SECRET:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Mac/Linux:**
```bash
openssl rand -base64 32
```

---

## 📊 Update Schema for PostgreSQL

When deploying to production, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from sqlite
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name switch_to_postgresql
```

---

## ✅ Post-Deployment Checklist

- [ ] Database connected and migrated
- [ ] Environment variables set
- [ ] Admin user created (run seed script)
- [ ] Test login at your production URL
- [ ] Test POS functionality
- [ ] Test barcode scanning
- [ ] Verify inventory updates
- [ ] Check sales recording

---

## 🔄 Update Production

To deploy updates:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Vercel/Railway will auto-deploy

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify DATABASE_URL is correct
- Check build logs for errors

### Database Connection Error
- Verify DATABASE_URL format
- Check database is running
- Ensure IP whitelist (if required)

### Login Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure admin user exists (run seed)

### Products Not Loading
- Run migrations: `npx prisma migrate deploy`
- Run seed script: `npm run db:seed`
- Check database connection

---

## 📱 Share with Your Tita

Once deployed, share:
1. Your production URL (e.g., https://pos-system.vercel.app)
2. Login credentials:
   - Email: admin@store.com
   - Password: admin123
3. Tell her to bookmark it on her phone/tablet

**Pro Tip:** She can add it to her home screen:
- iPhone: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Add to Home Screen

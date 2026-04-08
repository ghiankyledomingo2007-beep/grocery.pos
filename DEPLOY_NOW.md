# Deploy to Vercel - 5 Minutes

## Step 1: Push to GitHub (2 min)

```bash
cd pos-system
git init
git add .
git commit -m "POS system ready"
```

Create repo on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/pos-system.git
git push -u origin main
```

## Step 2: Deploy to Vercel (3 min)

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `pos-system` repository
5. Click "Deploy" (don't change anything yet)

## Step 3: Add Database (in Vercel dashboard)

1. Go to your project → "Storage" tab
2. Click "Create Database" → "Postgres"
3. Click "Create"
4. Vercel automatically adds DATABASE_URL

## Step 4: Add Other Environment Variables

In Vercel dashboard → Settings → Environment Variables:

**NEXTAUTH_SECRET:**
```
Run in PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

Copy the output
```

**NEXTAUTH_URL:**
```
https://your-project-name.vercel.app
(Get this from Vercel dashboard after first deploy)
```

## Step 5: Redeploy

1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## Step 6: Setup Database

In your computer terminal:
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull
npm run db:seed:prod
```

## Step 7: Share with Tita

Send her:
- URL: `https://your-project-name.vercel.app`
- Email: `admin@store.com`
- Password: `admin123`

Tell her to bookmark it or add to home screen!

---

## Alternative: Railway (if Vercel doesn't work)

1. Go to https://railway.app
2. Sign up with GitHub
3. "New Project" → "Deploy from GitHub"
4. Select your repo
5. Add PostgreSQL: "New" → "Database" → "PostgreSQL"
6. Add environment variables (same as above)
7. Railway auto-deploys!

---

## Need Help?

Your app is at: `https://YOUR_PROJECT.vercel.app`

Login: admin@store.com / admin123

# Quick Start Guide

## ✅ Setup Complete!

Your web-based POS system is ready to use.

## 🚀 Access the System

1. **Open your browser** and go to: http://localhost:3000

2. **Login with:**
   - Email: `admin@store.com`
   - Password: `admin123`

3. **Start using the POS!**

## 📦 What's Included

- 10 Filipino products pre-loaded
- 2 suppliers (SM Supermarket, Puregold)
- Admin user account
- Full POS functionality

## 🛠️ Commands

- **Start server**: `npm run dev` (already running)
- **Stop server**: Press Ctrl+C in the terminal
- **Reset database**: `npx prisma migrate reset`

## 🌐 Deploy for Remote Access (Your Tita)

To let your tita use it from anywhere:

1. **Sign up at Vercel**: https://vercel.com
2. **Install Vercel CLI**: `npm install -g vercel`
3. **Deploy**: Run `vercel` in the pos-system folder
4. **Share the URL** Vercel gives you

For production, you'll need to:
- Change database to PostgreSQL (Vercel provides free database)
- Update NEXTAUTH_SECRET in environment variables

## 💡 Features

- Barcode scanning
- Product search
- Multiple payment methods (Cash, GCash, Card)
- Real-time inventory updates
- Sales tracking
- Receipt generation

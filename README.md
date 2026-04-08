# Modern Web POS System 🏪

A production-ready Point of Sale system built with Next.js 16, TypeScript, Prisma, and NextAuth.

## 🌟 Features

- 🛒 **Complete POS Interface** - Barcode scanning, product search, cart management
- 📦 **Real-time Inventory** - Automatic stock updates after each sale
- 💰 **Multiple Payment Methods** - Cash, GCash, Card support
- 🔐 **Secure Authentication** - Role-based access (ADMIN, MANAGER, CASHIER)
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎯 **Filipino Products** - Pre-loaded with popular local products
- 📊 **Sales Tracking** - Complete transaction history
- 🏪 **Supplier Management** - Track product suppliers
- 🖨️ **Receipt Generation** - Print or display receipts
- ⚡ **Fast & Modern** - Built with latest Next.js and React

## 🚀 Quick Start (Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

### 3. Initialize Database
```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
```
http://localhost:3000
```

### 6. Login
- **Email:** `admin@store.com`
- **Password:** `admin123`

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16.2.2 (App Router) |
| Language | TypeScript 5 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 6 |
| Authentication | NextAuth.js v5 |
| Styling | Tailwind CSS 4 |
| UI Icons | Lucide React |
| State | Zustand |
| Notifications | React Hot Toast |

## 🌐 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for production"
git push
```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository

3. **Add Environment Variables**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

4. **Deploy!**
   - Vercel will automatically build and deploy
   - Run migrations and seed after deployment

📖 **Detailed Instructions:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

✅ **Launch Checklist:** See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

## 📁 Project Structure

```
pos-system/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── products/       # Product search API
│   │   └── sales/          # Sales API
│   ├── login/              # Login page
│   ├── pos/                # POS interface
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Client providers
├── lib/                     # Utilities
│   ├── auth.ts             # NextAuth config
│   └── prisma.ts           # Prisma client
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   ├── seed.ts             # Dev seed data
│   ├── seed.production.ts  # Production seed
│   └── migrations/         # Migration history
├── types/                   # TypeScript types
├── public/                  # Static assets
├── .env                     # Environment variables
├── .env.example            # Environment template
├── .env.production         # Production template
├── next.config.ts          # Next.js config
├── middleware.ts           # Security middleware
├── package.json            # Dependencies
├── DEPLOYMENT.md           # Deployment guide
├── PRODUCTION_CHECKLIST.md # Launch checklist
└── QUICK_START.md          # Quick reference
```

## 🔐 Security Features

- ✅ Secure password hashing (bcrypt)
- ✅ JWT-based sessions
- ✅ Role-based access control
- ✅ Security headers (CSP, XSS, etc.)
- ✅ HTTPS enforced in production
- ✅ Environment variable protection
- ✅ SQL injection prevention (Prisma)
- ✅ CSRF protection (NextAuth)

## 📱 Mobile Support

Works perfectly on:
- 💻 Desktop computers (Windows, Mac, Linux)
- 📱 Mobile phones (iPhone, Android)
- 📱 Tablets (iPad, Android tablets)

**Add to Home Screen** for app-like experience!

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Database
npm run db:seed         # Seed development database
npm run db:seed:prod    # Seed production database
npm run db:migrate:prod # Run production migrations

# Code Quality
npm run lint            # Run ESLint
```

## 📊 Database Schema

### Users
- Roles: ADMIN, MANAGER, CASHIER
- Secure authentication
- Active/inactive status

### Products
- Barcode scanning support
- Price and cost tracking
- Stock management
- Category organization
- Supplier relationships

### Suppliers
- Contact information
- Product associations
- Active/inactive status

### Sales
- Transaction records
- Payment method tracking
- Cashier assignment
- Timestamp tracking

### SaleItems
- Line item details
- Quantity and pricing
- Product relationships

## 🎯 Pre-loaded Products

System includes 10 popular Filipino products:
- Lucky Me Pancit Canton (₱15.00)
- Skyflakes Crackers (₱25.00)
- Mang Tomas Lechon Sauce (₱55.00)
- Fita Crackers (₱28.00)
- Lucky Me Instant Mami (₱18.00)
- Rebisco Crackers (₱30.00)
- Hansel Crackers (₱32.00)
- Lucky Me Beef Noodles (₱20.00)
- Cream-O Cookies (₱35.00)
- Lucky Me Chicken Noodles (₱20.00)

## 🔄 Updates & Maintenance

- Regular dependency updates
- Security patches
- Feature enhancements
- Bug fixes
- Performance optimizations

## 📞 Support & Documentation

- 📖 [Deployment Guide](./DEPLOYMENT.md)
- ✅ [Production Checklist](./PRODUCTION_CHECKLIST.md)
- 🚀 [Quick Start Guide](./QUICK_START.md)
- 🌐 [Vercel Docs](https://vercel.com/docs)
- 🗄️ [Prisma Docs](https://www.prisma.io/docs)
- 🔐 [NextAuth Docs](https://next-auth.js.org)

## 🎓 For Your Tita

Once deployed, share:
1. **URL:** Your production link (e.g., https://pos-system.vercel.app)
2. **Login:** admin@store.com / admin123
3. **Tip:** Bookmark it or add to home screen!

## 📄 License

Private - For internal use only

## 🙏 Built With

Modern web technologies for real-world grocery store operations.

---

## ✨ Ready for Production!

Follow these steps:
1. ✅ Review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
2. 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md)
3. 🚀 Deploy to Vercel or Railway
4. 🎉 Start selling!

**Need help?** Check the documentation files or deployment guides.

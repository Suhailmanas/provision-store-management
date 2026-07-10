# Kirana Store PWA - Quick Start Guide

## For Developers

### Local Development
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Generate BETTER_AUTH_SECRET
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Add DATABASE_URL from Neon to .env.local

# Start development server
pnpm dev

# Visit http://localhost:3000
```

### Create New Neon Database
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the "Connection String" 
5. Add to `.env.local` as `DATABASE_URL`

## For Production Deployment

### Step 1: Generate Secrets
```bash
openssl rand -base64 32
```
Copy this value - you'll need it in step 3.

### Step 2: Connect Database
1. Go to https://neon.tech
2. Create/use a Neon database project
3. Copy the connection string (includes password!)

### Step 3: Configure Vercel
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add for **Production** environment:
   - **Key**: `DATABASE_URL` → **Value**: Your Neon connection string
   - **Key**: `BETTER_AUTH_SECRET` → **Value**: Your generated secret

### Step 4: Deploy
```bash
git push origin main
```
Or use Vercel CLI:
```bash
vercel deploy --prod
```

### Step 5: Verify
After deployment completes:
1. Visit your deployed URL
2. You should see the sign-in page
3. Try creating an account
4. You should see the dashboard

## Troubleshooting

### "500 Internal Server Error"
→ Check that both `DATABASE_URL` and `BETTER_AUTH_SECRET` are set in Vercel

### "Cannot connect to database"
→ Verify DATABASE_URL is correct and Neon database is active

### "Sign up works but can't log in"
→ Check BETTER_AUTH_SECRET matches across environments

### "Data not persisting"
→ Confirm DATABASE_URL points to your Neon project

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Kirana Store PWA               │
├─────────────────────────────────────┤
│                                     │
│  Frontend (Next.js App Router)      │
│  - Dashboard, Products, Sales       │
│  - Service Worker (Offline)         │
│  - Mobile-responsive UI             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Backend (Better Auth + Drizzle)    │
│  - User Authentication              │
│  - Database Queries & Mutations     │
│  - Server Actions                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Database (Neon PostgreSQL)         │
│  - Users & Sessions                 │
│  - Products, Inventory              │
│  - Purchases, Sales                 │
│  - Daily Close Records              │
│                                     │
└─────────────────────────────────────┘
```

## Key Features

✓ User authentication (email/password)
✓ Real-time inventory tracking
✓ Sales & purchase management
✓ Daily closing mechanism
✓ Analytics & reports
✓ Offline-first support (PWA)
✓ Mobile-optimized interface
✓ Professional color scheme
✓ Responsive design

## Database Tables

- `user` - User accounts
- `session` - Auth sessions
- `products` - Store products
- `purchases` - Purchase records
- `sales` - Sale records
- `daily_close` - End-of-day closing
- `inventory_log` - Transaction history

## API Routes

- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

## Server Actions

- `getProducts()` - List all products
- `addProduct()` - Create new product
- `recordSale()` - Record a sale
- `recordPurchase()` - Record a purchase
- `getDashboardStats()` - Get dashboard metrics
- `getDailyClose()` - Record daily close

## Environment Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| DATABASE_URL | postgresql://... | Database connection |
| BETTER_AUTH_SECRET | AbC1234... | Auth encryption |
| NODE_ENV | production | Environment mode |

## File Structure

```
app/
├── page.tsx              # Dashboard home
├── sign-in/page.tsx      # Login page
├── sign-up/page.tsx      # Registration page
├── products/             # Products management
├── sales/                # Sales recording
├── purchases/            # Purchase tracking
├── reports/              # Analytics
├── daily-close/          # Daily closing
├── api/auth/             # Auth endpoints
└── actions/              # Server actions

components/
├── dashboard.tsx         # Main dashboard
├── navigation.tsx        # Bottom nav bar
├── products-list.tsx     # Products grid
├── sales-form.tsx        # Sale entry form
└── ...

lib/
├── auth.ts              # Better Auth config
├── auth-client.ts       # Client auth
├── db/
│   ├── index.ts         # Drizzle client
│   └── schema.ts        # Database schema
└── offline.ts           # Offline storage
```

## Support Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com)
- [Neon Docs](https://neon.tech/docs)
- [Drizzle Docs](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)

---

**Need help?** Check DEPLOYMENT.md for detailed setup instructions or PRODUCTION_FIXES.md for troubleshooting.

# 🚀 NomadVibe Trading Dashboard - Production Deployment Guide

## 📋 Overview

This guide provides comprehensive instructions for deploying the NomadVibe Trading Dashboard to production using Vercel. The application is built with Next.js 14, utilizes Supabase for database operations, and includes enterprise-grade security and performance optimizations.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   Next.js App    │    │   Supabase      │
│   (Static)      │◄──►│   (Server)       │◄──►│   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                       │
        │                        │                       │
    ┌───▼────┐              ┌────▼─────┐           ┌─────▼──────┐
    │ Users  │              │ API      │           │ PostgreSQL │
    │        │              │ Routes   │           │ + RLS      │
    └────────┘              └──────────┘           └────────────┘
```

## 🔧 Prerequisites

### Required Tools
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v8.0.0 or higher)
- [Vercel CLI](https://vercel.com/cli) (optional but recommended)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for database management)

### Accounts Needed
- [Vercel](https://vercel.com/) account
- [Supabase](https://supabase.com/) account
- [GitHub](https://github.com/) account (for repository hosting)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://app.supabase.com/)
2. Create a new project
3. Note down your project details:
   - Project URL: `https://your-project-ref.supabase.co`
   - Anon Key: `your-anon-key`
   - Service Role Key: `your-service-role-key`

### 2. Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create trades table
CREATE TABLE trades (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  pnl DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create positions table
CREATE TABLE positions (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  average_cost DECIMAL(10, 4),
  market_value DECIMAL(12, 2),
  unrealized_pnl DECIMAL(12, 2),
  realized_pnl DECIMAL(12, 2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_pnl table
CREATE TABLE daily_pnl (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  realized_pnl DECIMAL(12, 2) DEFAULT 0,
  unrealized_pnl DECIMAL(12, 2) DEFAULT 0,
  total_pnl DECIMAL(12, 2) GENERATED ALWAYS AS (realized_pnl + unrealized_pnl) STORED,
  trades_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_daily_pnl_date ON daily_pnl(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_pnl ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, restrict in production)
CREATE POLICY "Allow all operations on trades" ON trades FOR ALL USING (true);
CREATE POLICY "Allow all operations on positions" ON positions FOR ALL USING (true);
CREATE POLICY "Allow all operations on daily_pnl" ON daily_pnl FOR ALL USING (true);
```

### 3. Seed Data (Optional)

Run the seed script to populate with sample data:

```bash
npm run db:seed
```

## 🔐 Environment Variables Setup

### 1. Local Development

Copy the template file:

```bash
cp .env.example .env.local
```

Fill in your actual values in `.env.local`:

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional - External APIs
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
FINNHUB_API_KEY=your-finnhub-key

# Environment
NODE_ENV=development
```

### 2. Production (Vercel)

Set environment variables in Vercel:

#### Using Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

#### Using Vercel Dashboard:
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Settings > Environment Variables
3. Add each variable for Production, Preview, and Development environments

## 🚀 Deployment Process

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Auto-deployment:**
   - Every push to `main` branch triggers production deployment
   - Pull requests create preview deployments automatically

### Method 2: Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

## ⚡ Performance Optimizations

### 1. Build Optimizations

The project includes several performance optimizations:

- **Bundle Splitting:** Separates vendor, common, and feature-specific chunks
- **Image Optimization:** WebP/AVIF format support with responsive sizing
- **Code Minification:** SWC-based minification for faster builds
- **Tree Shaking:** Removes unused code automatically

### 2. Caching Strategy

```javascript
// Static assets: 1 year cache
Cache-Control: public, max-age=31536000, immutable

// API routes: 1 minute cache with stale-while-revalidate
Cache-Control: public, max-age=60, stale-while-revalidate=300

// Health check: No cache
Cache-Control: no-cache, no-store, must-revalidate
```

### 3. Database Optimizations

- **Connection Pooling:** Supabase handles automatically
- **Indexes:** Created for frequently queried columns
- **Query Optimization:** Efficient SQL queries with proper JOINs

## 🔒 Security Configuration

### 1. Security Headers

Automatically applied via `next.config.js` and `vercel.json`:

```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
```

### 2. CORS Configuration

```javascript
Access-Control-Allow-Origin: https://*.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. Environment Security

- All sensitive variables are server-side only
- Client-side variables use `NEXT_PUBLIC_` prefix
- No hardcoded secrets in code

## 📊 Monitoring & Analytics

### 1. Health Checks

Health check endpoint available at:
- `/api/health`
- `/healthz`
- `/health`

Response format:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production",
  "database": "connected",
  "uptime": 3600
}
```

### 2. Error Monitoring

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **Vercel Analytics** for performance monitoring

### 3. Database Monitoring

Monitor via Supabase Dashboard:
- Query performance
- Connection usage
- Storage usage
- API request counts

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🛠️ Maintenance & Updates

### 1. Regular Maintenance

```bash
# Update dependencies
npm update

# Security audit
npm audit

# Type check
npm run type-check

# Build test
npm run build
```

### 2. Database Maintenance

```bash
# Update database types
npm run db:types

# Reset database (development only)
npm run db:reset

# Backup database
supabase db dump > backup.sql
```

### 3. Performance Monitoring

```bash
# Analyze bundle size
npm run build:analyze

# Performance test
npm run lighthouse
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **Database Connection:**
   ```bash
   # Test database connection
   curl -X GET https://your-app.vercel.app/api/health
   ```

3. **Environment Variables:**
   ```bash
   # Pull latest environment variables
   vercel env pull .env.local
   ```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| 500  | Database connection failed | Check Supabase credentials |
| 404  | API route not found | Verify route configuration |
| 429  | Rate limit exceeded | Implement request throttling |

## 📈 Scaling Considerations

### 1. Database Scaling

- **Connection Limits:** Monitor Supabase connection usage
- **Query Optimization:** Use database indexes effectively
- **Read Replicas:** Consider for high-read workloads

### 2. Application Scaling

- **Vercel Functions:** Automatically scale based on demand
- **Edge Functions:** Use for global distribution
- **Caching:** Implement Redis for session management

### 3. Cost Optimization

- **Vercel:** Monitor function invocations and bandwidth
- **Supabase:** Track database operations and storage
- **APIs:** Monitor external API usage to avoid overages

## 🔗 Useful Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Deployment
npm run deploy             # Deploy to production
npm run deploy:preview     # Create preview deployment
npm run logs               # View deployment logs

# Database
npm run db:types           # Generate TypeScript types
npm run db:seed            # Seed database with sample data
npm run db:reset           # Reset database (dev only)

# Maintenance
npm run type-check         # Type checking
npm run lint               # Code linting
npm run health-check       # Test health endpoint
npm run env:pull           # Pull environment variables
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Performance Best Practices](https://nextjs.org/docs/advanced-features/measuring-performance)

## 🎯 Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test all API endpoints via health check
- [ ] Confirm database connectivity and queries
- [ ] Validate security headers are applied
- [ ] Test responsive design on multiple devices
- [ ] Monitor initial traffic and performance metrics
- [ ] Set up error monitoring and alerting
- [ ] Configure custom domain (if applicable)
- [ ] Test SSL certificate and HTTPS redirect
- [ ] Verify caching behavior is working correctly

---

## 📞 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review Vercel deployment logs
3. Verify environment variables
4. Test database connectivity
5. Check security settings

For additional support, refer to the official documentation or community forums.

---

**🎉 Congratulations! Your NomadVibe Trading Dashboard is now live in production!**
# 📱 PhoneSpec Platform

> Production-ready mobile phone specs & reviews platform.
> Multi-language (RTL/LTR) · Iraqi payment gateways · Full Cloudflare integration · 100% Admin-controlled.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14.2 · React 18.2 · TypeScript 5.4 · TailwindCSS 3.4 |
| i18n | next-intl · RTL/LTR · DB-backed translations |
| Backend | NestJS 10.3 · TypeScript 5.4 |
| ORM | Prisma 5.11 |
| Database | Supabase PostgreSQL 15 |
| Cache | Redis 7 (with graceful fallback) |
| Storage | Supabase Storage (images WebP + videos) |
| Auth | JWT · TOTP 2FA · IP restriction · Session tracking |
| Payments | ZainCash · QiCard · FIB (all DB-configured) |
| CDN / DNS | Cloudflare API (full Admin control) |
| Encryption | AES-256-CBC for secrets in DB |
| Deploy | Vercel (frontend) + Node server (backend) |

---

## Prerequisites

```
Node.js >= 20.x LTS
NPM >= 10.x
Git >= 2.40
Docker 24.x (optional, for local Redis)
```

---

## Step 1 — Unzip & Prepare

```bash
unzip phonespec-platform.zip
cd phonespec-platform
```

---

## Step 2 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. **Project Settings → Database** → copy Connection String (Transaction Pooler)
3. **Project Settings → API** → copy:
   - `Project URL`
   - `anon` public key
   - `service_role` secret key
4. **Storage** → Create 3 buckets (all Public):
   - `phone-images`
   - `phone-videos`
   - `media`
5. **SQL Editor** → run `backend/prisma/rls-policies.sql`

---

## Step 3 — Backend Setup

```bash
cd backend

# 1. Copy environment file
cp .env.example .env

# 2. Edit .env — fill in ALL required values:
#    DATABASE_URL        ← Supabase PostgreSQL connection string
#    SUPABASE_URL        ← https://xxx.supabase.co
#    SUPABASE_SERVICE_ROLE_KEY ← service role key (backend only)
#    JWT_SECRET          ← random string, min 64 chars
#    ENCRYPTION_KEY      ← random string, min 32 chars
#    FRONTEND_URL        ← http://localhost:3000
nano .env

# 3. Install dependencies
npm install

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed initial data
#    (creates Super Admin, languages, spec categories, payment gateways)
npm run prisma:seed

# 7. Start development server
npm run start:dev
```

✅ Backend running at: `http://localhost:3001`

Seed output will show:
```
📧 Admin email: (your INITIAL_ADMIN_EMAIL)
🔑 Admin password: (your INITIAL_ADMIN_PASSWORD)
```

---

## Step 4 — Frontend Setup

```bash
cd ../frontend

# 1. Copy environment file
cp .env.example .env.local

# 2. Edit .env.local:
#    NEXT_PUBLIC_API_URL         ← http://localhost:3001
#    NEXT_PUBLIC_SUPABASE_URL    ← your Supabase URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY ← anon key (frontend safe)
#    NEXT_PUBLIC_SITE_URL        ← http://localhost:3000
nano .env.local

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## Step 5 — Redis (optional but recommended)

```bash
# Using Docker:
docker run -d --name phonespec_redis -p 6379:6379 redis:7-alpine

# Or use Docker Compose (starts everything):
cd ..  # project root
docker-compose up -d redis
```

If Redis is unavailable, the app falls back to no-cache mode automatically.

---

## Step 6 — First Login & Configuration

1. Open `http://localhost:3000/admin-login`
2. Login with your seeded credentials
3. **IMMEDIATELY** go to:
   - **Admin → Settings → Security** → Change admin login URL
   - **Admin → Settings → General** → Set Site Name & URL
   - **Admin → Settings → Authentication** → Change password

### Site Configuration Checklist

**General (Admin → Settings → General)**
- [ ] Site Name
- [ ] Site URL (your domain)
- [ ] Site Description
- [ ] Logo & Favicon
- [ ] Default Language
- [ ] Default Theme (light/dark/system)

**Admin Security (Admin → Settings → Security)**
- [ ] Change Admin Login Path (e.g. `/my-secret-admin-2024`)
- [ ] Enable 2FA on your account
- [ ] Set IP allowlist if needed

**Languages (Admin → Languages)**
- [ ] Enable Arabic (RTL) or add new languages
- [ ] Add translations via the inline editor
- [ ] Import translation files (JSON) for bulk updates

**Cloudflare (Admin → Cloudflare)**
- [ ] Enter API Key, Account ID, Zone ID
- [ ] Enable CDN
- [ ] Configure WAF

**Payments (Admin → Payments)**
- [ ] Configure ZainCash (enter Merchant ID, MSISDN, secret, API URL)
- [ ] Configure QiCard (enter Access Key, Profile ID, Secret, API URL)
- [ ] Configure FIB (enter Client ID, Secret, API URL)
- [ ] Test each in Sandbox mode before going live
- [ ] Set webhook URLs in each gateway's dashboard

**Content**
- [ ] Add Brands (Admin → Brands)
- [ ] Add Phones with specs, images, videos
- [ ] Set SEO meta per phone, per language

---

## Step 7 — Add Content

### Add a Brand

1. Admin → Brands → Add New
2. Fill name, slug (auto-generated), upload logo
3. Add translations per language

### Add a Phone

1. Admin → Phones → Add New
2. Select brand
3. Fill all spec fields (categories and attributes are seeded)
4. Upload images (jpg/png/webp — auto-converted to WebP, thumbnail auto-generated)
5. Upload videos (mp4/webm/mov — up to 200MB)
6. Fill SEO meta per language (Meta Title, Description, OG Image, etc.)
7. Publish

---

## Step 8 — Production Deployment

### Backend → Node Server (Railway, DigitalOcean, Fly.io, etc.)

```bash
cd backend

# Build
npm run build

# Set all production env vars on your server, then:
npm start

# Or with PM2:
npm install -g pm2
pm2 start dist/main.js --name phonespec-api --env production
pm2 save && pm2 startup
```

### Frontend → Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel@34

vercel login

# Deploy
vercel --prod
```

**Set environment variables in Vercel Dashboard:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` |
| `NEXT_PUBLIC_LOCALES` | `en,ar` |

### Required Backend Production Env Vars

```env
NODE_ENV=production
DATABASE_URL=postgresql://...?sslmode=require
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=<64+ chars random>
ENCRYPTION_KEY=<32+ chars random>
REDIS_URL=redis://...
FRONTEND_URL=https://yourdomain.com
```

---

## Step 9 — Using Docker Compose (Full Stack)

```bash
# From project root:
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop
docker-compose down
```

> Note: Update `docker-compose.yml` with your env file paths or inline env vars.

---

## Post-Deployment QA Checklist

### Functional
- [ ] Can log in to admin panel
- [ ] Can add a brand and phone
- [ ] Phone page loads with images and specs
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt accessible at `/robots.txt`
- [ ] Arabic version loads with RTL layout correctly
- [ ] Search returns results

### Payments (Sandbox)
- [ ] ZainCash sandbox payment creates and redirects
- [ ] QiCard sandbox payment creates and redirects
- [ ] FIB sandbox payment creates
- [ ] Webhook callbacks update transaction status in Admin → Payments → Transactions

### SEO
- [ ] Page titles show correctly with template
- [ ] OG meta visible in social preview tools
- [ ] JSON-LD structured data validates at schema.org/validator
- [ ] Sitemap includes all phone and brand URLs in all languages

### Security
- [ ] Admin login path is changed from default
- [ ] Cannot access admin pages without login
- [ ] API returns 401 for unauthenticated admin routes
- [ ] Secrets not visible in gateway config (masked with ••••••)

### Performance
- [ ] Redis caching confirmed in backend logs
- [ ] Cloudflare CDN active (orange cloud in DNS)
- [ ] Images load as WebP (check Network tab in browser)

---

## Architecture Highlights

| Requirement | Implementation |
|---|---|
| ❌ No hardcoded values | ✅ `system_settings` table — all config in DB |
| ❌ No redeploy for config | ✅ Settings API with Redis cache (5min TTL) |
| ❌ No secrets in code | ✅ AES-256-CBC encryption for all API keys/secrets |
| ❌ No admin URL fixed | ✅ `admin_login_path` setting in DB, changeable at runtime |
| ✅ RTL support | ✅ `Language.direction` → `<html dir="">` |
| ✅ Supabase RLS | ✅ Policies in `rls-policies.sql` |
| ✅ anon vs service role | ✅ Frontend uses anon, backend uses service_role |

---

## Default Admin Credentials

After running `npm run prisma:seed`:

```
Email:    → value of INITIAL_ADMIN_EMAIL in backend/.env
Password: → value of INITIAL_ADMIN_PASSWORD in backend/.env
Login URL: /admin-login (change this immediately!)
```

---

## Troubleshooting

**Prisma migration fails:**
```bash
# Development reset (WARNING: deletes all data)
npx prisma migrate reset
# Production: check DATABASE_URL is correct and DB is reachable
```

**Tailwind CSS not loading in production:**
- Verify `tailwind.config.ts` `content` paths include all `src/**/*.tsx`
- Check `postcss.config.js` exists with `tailwindcss` and `autoprefixer`

**Redis connection errors:**
- App falls back to no-cache mode — check logs
- Ensure `REDIS_URL` is set correctly

**Supabase storage upload fails:**
- Verify bucket names match env vars
- Confirm service_role key is used (not anon key) in backend
- Check bucket is set to public in Supabase dashboard

**Cloudflare operations fail:**
- Verify API Token has: Zone:Read, Cache Purge, DNS:Edit permissions
- Confirm Account ID and Zone ID are correct (not swapped)

**Payment gateway errors:**
- Ensure `apiBaseUrl` is set correctly in gateway config (Admin → Payments)
- Check webhook URL is publicly accessible (not localhost)
- Verify all secrets are entered (not the masked ••••••• value)

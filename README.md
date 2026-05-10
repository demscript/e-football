# eFOOTBALL City Cup 2025

A production-ready, full-stack eFootball community tournament management platform.

> **Community project — not affiliated with Konami or eFootball officially.**

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS + Framer Motion |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (credentials) |
| Realtime | Pusher |
| State | Zustand |
| Validation | Zod + React Hook Form |
| Deploy | Vercel + Supabase/Neon |

---

## Quick Start (Local)

### 1. Install dependencies

```bash
cd e-football
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/efootball_tournament?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32+-character-secret"
ADMIN_EMAIL="admin@efootball.local"
ADMIN_PASSWORD="Admin@12345"

# From pusher.com (free tier)
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER="eu"
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER="eu"
```

### 3. Set up database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (first time)
npm run db:push

# Seed admin user + sample data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Visit:
- **Landing Page**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/dashboard
- **Live Bracket**: http://localhost:3000/tournament
- **Register**: http://localhost:3000/register

---

## Admin Credentials (after seed)

```
Email:    admin@efootball.local
Password: Admin@12345
```

Change these in production!

---

## Pusher Setup (Realtime)

1. Go to [pusher.com](https://pusher.com) and create a free account
2. Create a new **Channels** app
3. Choose your cluster (e.g. `eu` for Europe, `ap2` for Africa)
4. Copy the App ID, Key, Secret, and Cluster into `.env.local`

Pusher free tier: 200,000 messages/day, 100 simultaneous connections — more than enough.

---

## Deployment to Vercel + PostgreSQL

### Option A: Vercel + Neon (Recommended, Free)

1. Create a Neon database at [neon.tech](https://neon.tech) — free tier
2. Copy the connection string as `DATABASE_URL`
3. Deploy to Vercel:

```bash
npx vercel
```

4. Set all environment variables in Vercel dashboard
5. Run migrations:

```bash
# From local, targeting production DB
DATABASE_URL="your-production-url" npm run db:push
DATABASE_URL="your-production-url" npm run db:seed
```

### Option B: Vercel + Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string (URI mode)
3. Add `?pgbouncer=true&connection_limit=1` to the URL
4. Same Vercel deployment steps as above

### Vercel Environment Variables

Set these in your Vercel project → Settings → Environment Variables:

```
DATABASE_URL
NEXTAUTH_URL (your production URL, e.g. https://yourapp.vercel.app)
NEXTAUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
PUSHER_APP_ID
PUSHER_KEY
PUSHER_SECRET
PUSHER_CLUSTER
NEXT_PUBLIC_PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER
NEXT_PUBLIC_APP_URL
```

---

## Architecture

```
app/
├── (public)/          — Landing, register, tournament pages
│   ├── page.tsx       — Landing page
│   ├── register/      — Player registration
│   └── tournament/    — Live public bracket
├── admin/             — Protected admin area
│   ├── dashboard/     — Stats + quick actions
│   ├── players/       — Registration management
│   ├── matches/       — Score recording
│   ├── bracket/       — Admin bracket view
│   └── logs/          — Audit trail
├── api/
│   ├── auth/          — NextAuth handlers
│   ├── players/       — Registration + management
│   ├── matches/       — Score recording
│   ├── tournament/    — Bracket generation + advancement
│   ├── incidents/     — Disconnect/dispute logging
│   ├── stats/         — Dashboard stats
│   └── export/        — CSV export

components/
├── ui/                — Base components (Button, Card, Input...)
├── landing/           — Landing page sections
├── admin/             — Admin-specific components
└── tournament/        — Bracket + leaderboard

lib/
├── prisma.ts          — Database client singleton
├── auth.ts            — NextAuth config
├── pusher.ts          — Realtime client/server
├── tournament-engine.ts — Bracket generation logic
├── validations.ts     — Zod schemas
└── utils.ts           — Helpers
```

---

## Tournament Flow

```
1. Admin opens registration → players register
2. Admin reviews & approves players
3. Admin clicks "Generate Bracket" → single-elimination bracket created
4. Matches are played → admin records scores
5. Admin clicks "Advance Round" → next round generated automatically
6. Repeat until Final → champion crowned
```

### Bracket Engine

- Randomly shuffles approved players
- Fills to next power of 2 with BYE slots
- Single-elimination format
- Supports 2–64 players (5 rounds max)
- Byes auto-advance players in odd brackets

---

## Key Features

| Feature | Status |
|---|---|
| Player registration + validation | ✅ |
| Duplicate detection | ✅ |
| Admin approve/reject/disqualify | ✅ |
| Auto bracket generation | ✅ |
| Single elimination matchmaking | ✅ |
| Score recording | ✅ |
| Auto round advancement | ✅ |
| Live bracket visualization | ✅ |
| Realtime updates (Pusher) | ✅ |
| Live player count | ✅ |
| Leaderboard | ✅ |
| Incident logging | ✅ |
| Audit logs | ✅ |
| CSV export | ✅ |
| Countdown timer | ✅ |
| FAQ | ✅ |
| Dark esports theme | ✅ |
| Mobile responsive | ✅ |
| Glassmorphism UI | ✅ |
| Framer Motion animations | ✅ |

---

## Database Schema

See `prisma/schema.prisma` for the full schema. Key models:

- **User** — admins only
- **Player** — tournament registrants
- **Tournament** — single tournament instance
- **Round** — one round per bracket level
- **Match** — individual match with scores
- **Incident** — disconnect/dispute records
- **AuditLog** — all admin actions

---

## Prize Structure

| Place | Prize |
|---|---|
| 🥇 1st | ₦10,000 |
| 🥈 2nd | ₦5,000 |
| 🥉 3rd | ₦3,000 |
| **Total** | **₦18,000** |

---

## License

Community project. Not for commercial resale.

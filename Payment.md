Roar, let's operationalize this tech stack like we’re launching a product sprint on Monday morning with caffeine in our veins and KPIs chasing us from behind. I’ll break it down into an *action-ready blueprint* so you can go from zero → fully scaffolded MVP with momentum.

The vibe: simple, clean architecture, low cognitive load, high scalability.

---

## 🚀 STEP 1 — Create Your Next.js Project (App Router)

Fire up your terminal and bootstrap the monolith-that-isn’t-a-monolith:

```bash
npx create-next-app@latest hotel-mvp --typescript --tailwind
```

This gives you:
• Next.js 15
• App Router
• Tailwind preconfigured
• TS enabled

Folder structure auto-optimized for server components.

Move into the project:

```bash
cd hotel-mvp
```

---

## 🧱 STEP 2 — Install Core Libraries (UI + Utils)

### Tailwind UI Addons (shadcn)

```bash
npx shadcn-ui@latest init
```

Then add components as needed:

```bash
npx shadcn-ui@latest add button input card form
```

### React Query (optional but recommended)

```bash
npm install @tanstack/react-query
```

If you don't want state complexity, skip this. Next.js server actions + fetch are enough for MVP.

---

## 🗄️ STEP 3 — Setup Database (Supabase + Prisma + PostgreSQL)

### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com/)
2. Sign in → New Project
3. Choose:
   • Password
   • Region close to Africa (for speed)
   • Free tier is fine for MVP

### Grab DB URL

In Supabase Dashboard → Project Settings → Database → Connection string:

Copy the `postgresql://...` URL.

### Install Prisma

Inside your app:

```bash
npm install prisma @prisma/client
npx prisma init
```

Open `prisma/schema.prisma` and update datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Put the DB URL inside `.env`:

```
DATABASE_URL="postgresql://..."
```

### Define your tables (MVP version)

Suites, bookings, guests, payments:

```prisma
model Suite {
  id        String  @id @default(cuid())
  name      String
  price     Int
  capacity  Int
  img       String?
  bookings  Booking[]
}

model Booking {
  id            String   @id @default(cuid())
  suiteId       String
  email         String
  checkIn       DateTime
  checkOut      DateTime
  ticketNumber  String   @unique
  paymentId     String?
  createdAt     DateTime @default(now())

  suite Suite @relation(fields: [suiteId], references: [id])
}
```

Push to DB:

```bash
npx prisma db push
```

Boom — database locked and loaded.

---

## 💳 STEP 4 — Payments (Stripe Checkout + Webhooks)

### Install Stripe SDK

```bash
npm install stripe
```

### Create Stripe Account & API Keys

[https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

Copy the secret key to `.env`:

```
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_..."
```

### Create a Checkout Route in Next.js

File: `/app/api/checkout/route.ts`

```ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { suiteId, amount, email } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Hotel Suite ${suiteId}` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    customer_email: email,
  });

  return NextResponse.json({ url: session.url });
}
```

This pushes users straight to Stripe's hosted page → PCI compliance handled.

### Webhook Setup

Run:

```bash
stripe login
```

Then:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Create `/app/api/webhook/route.ts`
(We’ll connect payments → booking confirmation → email → DB save.)

---

## 📩 STEP 5 — Email (SendGrid)

Install:

```bash
npm install @sendgrid/mail
```

Set env:

```
SENDGRID_KEY="SG_..."
```

Send email on successful booking:

* Ticket number
* Booking dates
* Suite info
* Confirmation code

Built inside the webhook handler.

---

## ☁️ STEP 6 — Deploy to Vercel

From project root:

```bash
npm run build
vercel
```

Connect GitHub repo → every push deploys automatically.

Set environment variables inside Vercel dashboard.

---

## 🏗️ STEP 7 — Core MVP Features

### Landing Page

• Suites
• Prices
• Gallery
• CTA: “Book Now”

### Booking Without Signup

User flow:

1. Pick Suite
2. Enter biodata (email, name, dates)
3. Pay via Stripe
4. Auto-generate “Ticket Number”
5. Email sent
6. Entry saved in Prisma DB
7. User shows ticket number at check-in

### Admin Dashboard (Phase 2)

• View bookings
• Check-in guests
• Manage suites
• Revenue insights

---

## You’re Ready To Build 🚀

You have the tech stack, the implementation flow, and the infra blueprint.
If you want, I can generate:

• Your folder structure
• Prisma models for full system
• Stripe webhook code
• Booking form UI (Next.js + shadcn)
• Admin dashboard
• Routing plan
• API route architecture

Each piece is modular — we can ship your MVP fast.

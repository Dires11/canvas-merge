# Canvas Merge

Canvas Merge is a Next.js application that integrates with the Canvas LMS API to allow users to connect multiple Canvas accounts and unify their course and planner data into a single, streamlined dashboard. By centralizing assignments, schedules, and course information across accounts, it eliminates the need to switch between platforms and simplifies academic management.

Live site: [canvas-merge.vercel.app](https://canvas-merge.vercel.app)

## Screenshots

### Dashboard

| ☀️ Light Mode                      | 🌙 Dark Mode                            |
| ---------------------------------- | --------------------------------------- |
| ![](./public/readme/dashboard.png) | ![](./public/readme/dashboard-dark.png) |

### Filters

| ☀️ Light Mode                   | 🌙 Dark Mode                         |
| ------------------------------- | ------------------------------------ |
| ![](./public/readme/filter.png) | ![](./public/readme/filter-dark.png) |

## Features

- Clerk sign-in flow for protected pages
- Multi-account Canvas connection flow
- Encrypted storage for Canvas personal access tokens
- Unified dashboard for courses and planner data
- Prisma-backed Postgres data layer

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma
- Clerk
- Tailwind CSS 4

## Environment Variables

Create a `.env` file with the values your environment needs:

```bash
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CANVAS_TOKEN_KEY=
```

Notes:

- `DATABASE_URL` is used by the Prisma client at runtime.
- `DIRECT_URL` is used by Prisma config and migrations.
- `CANVAS_TOKEN_KEY` must be a base64-encoded 32-byte key.

## Getting Started

Install dependencies:

```bash
npm install
```

Run your database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## App Flow

1. Visit the landing page and sign in.
2. Open `/dashboard` after signing in.
3. If no Canvas accounts are connected yet, the dashboard guides the user through connecting one.
4. Once connected, the dashboard loads merged courses and planner data.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

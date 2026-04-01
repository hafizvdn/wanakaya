# CLAUDE.md — Wanakaya

> Personal finance tracker web app. This file gives Claude full project context at the start of every session.
> Keep the **Current Status** section updated as you build.

---

## 1. Project Overview

**Wanakaya** is a personal finance tracker built for solo use. It lets me log income and expenses, set budgets per spending category, track savings goals, and visualise financial trends with charts.

**Goals:**
- Simple, fast daily logging of transactions
- Monthly budget enforcement with category-level visibility
- Savings goal progress tracking (target amount + deadline)
- Dashboard with meaningful charts (spending breakdown, monthly trend, goal progress)
- Clean, responsive UI I actually enjoy using

**Not in scope (for now):**
- Multi-user / sharing
- Bank/API integrations (manual entry only)
- Mobile app (web-responsive is sufficient)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL, Prisma ORM |
| Auth | NextAuth.js (single user, credential provider) |
| Hosting (planned) | Vercel (frontend), Railway or Render (backend + DB) |

**Key libraries:**
- `prisma` + `@prisma/client` — ORM and migrations
- `recharts` — All charts (BarChart, LineChart, PieChart, AreaChart)
- `next-auth` — Session management
- `zod` — Request validation on the backend
- `date-fns` — Date manipulation
- `axios` or `fetch` — HTTP client on the frontend

---

## 3. Folder Structure

```
wanakaya/
├── client/                     # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable primitives (Button, Card, Modal, Input)
│   │   │   ├── charts/         # Recharts wrappers (SpendingPieChart, TrendAreaChart, etc.)
│   │   │   ├── transactions/   # TransactionList, TransactionForm, TransactionRow
│   │   │   ├── budgets/        # BudgetCard, BudgetProgress, BudgetForm
│   │   │   └── goals/          # GoalCard, GoalProgress, GoalForm
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Goals.jsx
│   │   │   └── Login.jsx
│   │   ├── hooks/              # Custom hooks (useTransactions, useBudgets, useGoals)
│   │   ├── lib/
│   │   │   ├── api.js          # Axios instance + API helper functions
│   │   │   └── utils.js        # Formatters (currency, date, percentage)
│   │   ├── context/            # React context (AuthContext, etc.)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   ├── budgets.js
│   │   │   ├── goals.js
│   │   │   └── categories.js
│   │   ├── controllers/        # Route handler logic
│   │   ├── middleware/
│   │   │   ├── auth.js         # Session/JWT validation
│   │   │   └── validate.js     # Zod schema validation middleware
│   │   ├── lib/
│   │   │   └── prisma.js       # Prisma client singleton
│   │   └── index.js            # Express app entry point
│   ├── .env
│   └── package.json
│
├── CLAUDE.md                   # ← This file
└── README.md
```

---

## 4. Database Schema Summary

All monetary values are stored as **integers in sen (1/100 of RM)** to avoid floating-point issues. Divide by 100 to display.

### `User`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| email | String | Unique |
| password | String | Hashed (bcrypt) |
| name | String? | Display name |
| createdAt | DateTime | |

### `Category`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | e.g. "Food", "Transport" |
| type | Enum | `INCOME` \| `EXPENSE` |
| icon | String? | Emoji or icon key |
| userId | String | FK → User |

### `Transaction`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| amount | Int | In sen |
| type | Enum | `INCOME` \| `EXPENSE` |
| categoryId | String | FK → Category |
| note | String? | Optional description |
| date | DateTime | Transaction date |
| userId | String | FK → User |
| createdAt | DateTime | |

### `Budget`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| categoryId | String | FK → Category (one budget per category per period) |
| limitAmount | Int | In sen |
| period | Enum | `MONTHLY` \| `WEEKLY` |
| month | Int? | 1–12 (for monthly budgets) |
| year | Int? | e.g. 2025 |
| userId | String | FK → User |

### `SavingsGoal`
| Column | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String | e.g. "New Laptop" |
| targetAmount | Int | In sen |
| savedAmount | Int | In sen, updated manually |
| deadline | DateTime? | Optional target date |
| userId | String | FK → User |
| createdAt | DateTime | |

---

## 5. Coding Conventions

### General
- Use **ES modules** (`import`/`export`) everywhere, both client and server
- Prefer `async/await` over `.then()` chains
- No `any` types — use JSDoc comments for type hints if not using TypeScript
- Keep functions small and single-purpose
- Monetary values: **always integers in sen** internally; only format to RM at the display layer

### Frontend (React)
- **Component files:** PascalCase (`TransactionForm.jsx`)
- **Hook files:** camelCase prefixed with `use` (`useTransactions.js`)
- **Utility/lib files:** camelCase (`formatCurrency.js`)
- Use functional components and hooks only — no class components
- Colocate a component's styles in the same file using Tailwind utility classes
- API calls live in `src/lib/api.js` or a custom hook — never inline in components
- Currency display: always use a `formatCurrency(sen)` helper that returns `"RM X.XX"`
- Date display: use `date-fns` format helpers (`format(date, 'dd MMM yyyy')`)

### Backend (Express)
- **Route files** define paths only; logic lives in **controller files**
- Always validate request bodies with Zod before hitting the DB
- Return consistent JSON responses:
  ```json
  { "success": true, "data": { ... } }
  { "success": false, "error": "Message here" }
  ```
- Use the Prisma singleton from `src/lib/prisma.js` — never instantiate `PrismaClient` elsewhere
- Wrap all async route handlers in a `try/catch` or use an `asyncHandler` wrapper
- HTTP status codes: `200` success, `201` created, `400` bad request, `401` unauthorised, `404` not found, `500` server error

### Database / Prisma
- Always run `npx prisma migrate dev --name <description>` for schema changes
- Never edit migration files after they've been applied
- Use `prisma.user.findUnique` over `findFirst` when querying by unique fields

### Charts (Recharts)
- All chart components live in `client/src/components/charts/`
- Each chart is a self-contained wrapper component that accepts pre-formatted data as props
- Data transformation (grouping, summing, sorting) happens in hooks or utility functions — not inside chart components
- Use consistent colour palette defined in `tailwind.config.js` custom colours

---

## 6. Current Status

> **Update this section at the start / end of every session.**

### Last updated: 2026-03-26

### What's done:
- [x] Project scaffolded (client + server folders, all files created)
- [x] Prisma schema written (User, Category, Transaction, Budget, SavingsGoal)
- [x] JWT auth on Express (login, register, /me) — replaced NextAuth (incompatible with plain Express)
- [x] Basic Express server running with auth + validate middleware
- [x] Category CRUD (routes + controller + useCategories hook)
- [x] Transaction CRUD (routes + controller + useTransactions hook + TransactionList/Form/Row)
- [x] Budget CRUD (routes + controller + useBudgets hook + BudgetCard/Form/Progress)
- [x] Savings Goals CRUD (routes + controller + useGoals hook + GoalCard/Form/Progress)
- [x] Dashboard page with summary cards + SpendingPieChart
- [x] Recharts chart components (SpendingPieChart, TrendAreaChart, BudgetBarChart, GoalProgressChart)
- [x] Shared Layout with sidebar nav
- [ ] Run `npm install` in both client/ and server/
- [ ] Run `npx prisma migrate dev --name init` in server/
- [ ] Responsive layout + mobile polish

### What's in progress:
- Dependencies not yet installed (npm install not run)
- Database not yet migrated

### What's next:
1. `cd server && npm install && npx prisma migrate dev --name init`
2. `cd client && npm install && npm run dev`
3. Test auth flow (register → login → dashboard)

### Known issues / blockers:
- server/.env has placeholder DATABASE_URL — update with real PostgreSQL credentials before migrating
- NextAuth.js from the original spec was replaced with JWT (jsonwebtoken + bcryptjs) since NextAuth requires Next.js

### Recent decisions:
- Auth: replaced NextAuth.js with JWT (jsonwebtoken) on Express — NextAuth is a Next.js library and cannot run on a plain Express server
- Monorepo: client/ and server/ are sibling folders under wanakaya/
- Vite proxy: /api requests in dev are proxied to localhost:3001 so no CORS issues during development

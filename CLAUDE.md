# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

No test framework configured.

## Architecture

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · localStorage (no database)

**App name:** CashFlow Babe — expense tracker MVP for a small business owner.

### Route structure

```
/                   → redirect logic (checks onboarding + setup state)
/onboarding         → 3-slide carousel (sets cashflow_onboarded in localStorage)
/setup              → business name + currency form (sets cashflow_setup)
/dashboard          → summary stats, quick actions, recent transactions, reminders alert
/income             → list + add income (bottom sheet form)
/expenses           → list + add expense + receipt photo upload (bottom sheet)
/debtors            → debtors list, mark paid, outstanding total
/reports            → income/expense breakdown by category, Excel export
/reminders          → recurring expense reminders with due-soon alerts
```

`/dashboard` through `/reminders` live in `src/app/(app)/` — a route group that wraps all pages with `BottomNav` via `src/app/(app)/layout.tsx`.

### Data layer (`src/lib/`)

- **`types.ts`** — all TypeScript interfaces (`Income`, `Expense`, `Debtor`, `Reminder`, `AppSetup`) and category constant maps (`INCOME_CATEGORIES`, `EXPENSE_CATEGORIES`, `CURRENCIES`, etc.)
- **`storage.ts`** — all localStorage read/write via the `storage` object (CRUD for each entity + `getSummary()`)
- **`format.ts`** — `formatCurrency()`, `formatDate()`, `today()`, `getMonthRange()`, `daysUntil()`
- **`export.ts`** — `exportToExcel()` using the `xlsx` (SheetJS) package
- **`utils.ts`** — `cn()` (clsx + tailwind-merge)

### localStorage keys

```
cashflow_onboarded  boolean
cashflow_setup      AppSetup { businessName, currency, setupDone }
cashflow_income     Income[]
cashflow_expenses   Expense[]
cashflow_debtors    Debtor[]
cashflow_reminders  Reminder[]
```

### UI components (`src/components/`)

- **`ui/bottom-sheet.tsx`** — slide-up modal used for all add forms (no external library)
- **`ui/category-chips.tsx`** — horizontal scrollable pill selector for categories
- **`ui/button.tsx`** — CVA-based button with variants: `default`, `destructive`, `outline`, `ghost`, `secondary`, `danger`
- **`ui/input.tsx`** — input with optional label + error
- **`ui/textarea.tsx`** — textarea with optional label
- **`ui/badge.tsx`** — status badge with variants: `success`, `danger`, `warning`, `neutral`
- **`layout/bottom-nav.tsx`** — fixed bottom nav with 5 tabs (Dashboard, Income, Expenses, Debtors, Reports)

### Key conventions

- Tailwind v4: no `tailwind.config.js`; theme customisation goes in `globals.css` `@theme` block
- Path alias: `@/*` → `./src/*`
- All pages using localStorage must be `'use client'`
- Receipt photos are stored as base64 in localStorage (warn users if image > 2MB)
- `crypto.randomUUID()` used for IDs (no uuid package needed)
- Mobile-first layout: `max-w-[430px] mx-auto` on the app shell

### Future migration path (localStorage → Supabase)

The storage layer is isolated in `src/lib/storage.ts`. Swapping to Supabase means replacing this file's functions with Supabase client calls — types and page components stay unchanged.

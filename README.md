# Daily Driver — LeetCode

A personal, single-user, frontend-only LeetCode scheduler. Tells you exactly what problems to do today, tracks your history, and enforces spaced repetition + active recall — without you having to think about any of it.

The app does **one job**: it schedules. No problems are solved inside it. Every problem card opens directly to `leetcode.com`.

---

## Why

NeetCode 150 / Blind 75 are great lists, but there are two real problems with grinding through them:

1. **Pattern starvation.** If you go in order, you'll have deep coverage of arrays and zero exposure to graphs or DP if you stop halfway. This app interleaves patterns so you've touched every major category by problem 10.
2. **No reinforcement.** Without a feedback loop, hard problems stay hard. This app surfaces problems you struggled with after a 3-day gap and forces you to write your own active-recall question after every solve.

Built for one user (no auth, no multi-tenancy), but easy to fork for yourself.

---

## Features

- **Daily session.** Decides what you do today: a mix of new problems and due reviews. Stable across page reloads.
- **Pattern interleaving.** New problems are pulled from rotating "interleave groups" so you cover every pattern from day one, not all-arrays-then-all-graphs.
- **Spaced repetition.** Problems you flagged as "struggled" come back as reviews after 3+ days.
- **Active recall.** Every solve requires you to write a question about what you learned. Reviews show you that question and let you grade yourself.
- **Stats.** Total solved, current streak, problems due tomorrow.
- **Dark utilitarian UI.** Looks like a CLI tool. Mobile-responsive.

No auth, no analytics, no notes editor, no PWA, no timer.

---

## Stack

- **Next.js 14** (App Router, TypeScript) deployed to Vercel
- **Tailwind CSS** for styling
- **Supabase** (Postgres) for storage — `anon`/publishable key only, RLS off, single hardcoded user
- **No backend.** All scheduling logic runs in the browser.

---

## Prerequisites

- Node.js 18+ (20+ recommended)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (optional, only for deploy)

---

## Setup — From Zero to Running

### 1. Clone and install

```bash
git clone <your-fork-url>
cd leetcode
npm install
```

### 2. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Wait ~2 minutes for it to provision.
3. Go to **Settings → API Keys**. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxx.supabase.co`)
   - **Publishable key** (starts with `sb_publishable_...`)

> **Note on API keys:** Supabase migrated from the legacy `anon`/`service_role` JWT keys to new `sb_publishable_...`/`sb_secret_...` keys in mid-2025. This app uses the publishable key, but it'll fall back to the legacy `anon` key if you set `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.

### 3. Wire up env vars

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_yourkey...
```

### 4. Create the database schema

In the Supabase dashboard, open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.

This creates two tables:

- `problems` — the static seed (150 problems). Never changes after seeding.
- `attempts` — append-only log of every time you mark a problem done.

Both tables have RLS disabled. This is intentional for a single-user, single-device app — it's not safe if you share the URL.

### 5. Seed the problem bank

```bash
npm run seed
```

This upserts all 150 problems (NeetCode 150 ∪ Blind 75) into the `problems` table. Idempotent — safe to re-run.

### 6. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

You should see today's session with 5 problems (the default). Click the gear icon to change the daily count.

---

## How the Scheduler Works

Every page load runs the algorithm in `lib/scheduler.ts`. Inputs: all your past attempts + today's date + your `dailyCount` setting.

### Step 1 — Find due reviews

A problem is **due** if all three are true:
- You've attempted it at least once.
- Your most recent attempt had `struggled = true`.
- That attempt was at least 3 days ago.

Sorted by oldest-first.

### Step 2 — Split slots

```
review_slots = min(due_reviews.length, floor(dailyCount * 0.6))
new_slots    = dailyCount - review_slots
```

Reviews never take more than 60% of the session. If there are no due reviews, it's all new problems.

### Step 3 — Pick new problems via interleave groups

Each problem has an `interleave_group` integer 1–10, assigned at seed time. Within each pattern, problems are sorted by difficulty (Easy → Medium → Hard) and dealt out 1, 2, 3… 10, 1, 2…

This means **group 1 contains one problem from every pattern** (the easiest of each), group 2 the second-easiest, etc.

The scheduler picks unseen problems from the lowest-numbered group with availability. Result: after every 10 new problems, you've touched every major pattern.

### Step 4 — Interleave reviews and new

Final list mixes review and new problems with reviews evenly spaced — so reviews aren't all front-loaded.

---

## How a Solve Works

1. Card shows: title, pattern, difficulty, source list.
2. Click **Open on LeetCode** → opens leetcode.com in a new tab. The "Mark Done" button stays disabled until you've clicked this (forces you to actually open the problem).
3. Click **Mark Done** → modal opens.
4. Modal asks:
   - Did you struggle? (Yes/No)
   - Your own difficulty rating (Easy/Medium/Hard, defaults to LeetCode's label)
   - Write a question about what you learned (min 10 chars)
5. Save → row inserted into `attempts`, card marked complete.

For **review cards**, the card also shows your prior question and asks "Could you answer it?" before letting you mark done. That self-assessment becomes the new `active_recall_answer` for the next review.

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel, **New Project → Import** your repo.
3. Add environment variables (Production + Preview + Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy. Vercel auto-detects Next.js — no extra config.

**Important:** the publishable key is bundled into the browser. Anyone with your deployed URL can read and write your data. This is by design for a personal tool, but **don't share the URL publicly.** If you need to, either:
- Turn on RLS in Supabase and add policies (you'll need to add auth too).
- Put the Vercel deployment behind a password (Vercel Pro feature) or behind Cloudflare Access.

Never put `sb_secret_...` keys into `NEXT_PUBLIC_*` env vars — they'd leak to the browser.

---

## Customization

### Change problems per day

Click the gear icon in the app. Stored in `localStorage`, per-device.

### Change the problem bank

Edit `lib/problems.ts`. Each problem needs:
- `id`: the LeetCode slug (the part after `/problems/` in the URL)
- `title`, `slug`, `difficulty`, `pattern`, `source`

`interleave_group` is computed automatically. After editing, run `npm run seed` again.

### Change the review interval

Default is 3 days. Edit the `daysBetween(...) < 3` check in `lib/scheduler.ts`.

### Change the review cap

Default is 60% of daily slots. Edit `Math.floor(dailyCount * 0.6)` in `lib/scheduler.ts`.

---

## File Structure

```
.
├── app/
│   ├── page.tsx              # main page, session orchestration
│   ├── layout.tsx            # fonts, metadata
│   └── globals.css           # tailwind + custom CSS
├── components/
│   ├── ProblemCard.tsx       # new + review card rendering
│   ├── LogModal.tsx          # mark-done modal
│   ├── SettingsPanel.tsx     # daily count input
│   └── StatsBar.tsx          # streak, total, due-tomorrow
├── lib/
│   ├── supabase.ts           # lazy-initialized client
│   ├── scheduler.ts          # pure scheduling logic
│   └── problems.ts           # full 150-problem seed bank
├── types/
│   └── index.ts              # Problem, Attempt, SessionProblem
├── scripts/
│   └── seed.ts               # one-time problem-bank upsert
├── supabase/
│   └── schema.sql            # CREATE TABLE statements
├── .env.example
└── package.json
```

---

## Database Schema

```sql
create table problems (
  id text primary key,                    -- LeetCode slug
  title text not null,
  leetcode_url text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  pattern text not null,                  -- e.g. 'Sliding Window'
  source text not null check (source in ('neetcode150', 'blind75', 'both')),
  interleave_group int not null           -- 1-10
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  problem_id text references problems(id),
  attempted_at timestamptz not null default now(),
  struggled boolean not null,
  personal_difficulty text not null check (personal_difficulty in ('Easy', 'Medium', 'Hard')),
  active_recall_question text not null,   -- you write this
  active_recall_answer text,              -- you fill on review
  is_review boolean not null default false
);
```

`attempts` is **append-only**. The full history of every solve is kept. Reviews insert new rows; nothing is ever updated.

---

## Design Notes

- **JetBrains Mono** for display, **IBM Plex Sans** for body. Both via `next/font/google`.
- Single accent color (amber `#e9b44c`). No purple. No pill buttons. Sharp corners.
- Difficulty colors muted versions of LeetCode's green/yellow/red.
- Today's session is cached in `localStorage` so the list stays stable across reloads — recomputed only when the date changes.

---

## Troubleshooting

**`Could not find the table 'public.attempts'`**
You skipped step 4. Run `supabase/schema.sql` in the SQL Editor.

**`Supabase env vars not set`**
Either `.env.local` is missing those values or the dev server wasn't restarted after editing it. Stop and re-run `npm run dev`.

**Mark Done is disabled**
Click "Open on LeetCode" first. The button enables only after you've actually opened the problem (and, for reviews, answered the self-assessment).

**Scheduler picks the same problems forever**
That means you've completed all 150 problems — congrats. Add more to `lib/problems.ts` and re-seed.

---

## License

MIT. Fork it, change it, make it yours.

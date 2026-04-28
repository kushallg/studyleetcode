# LeetCode Daily Driver — Claude Code Prompt

## Project Overview

Build a personal daily LeetCode scheduling web app for one user (Kushal). It is a single-page frontend-only app deployed to Vercel. All data persists in Supabase. The app does one job: tell Kushal exactly what LeetCode problems to do today, track his history, and enforce spaced repetition + active recall without him having to think about any of it.

**Core constraint**: No problem is ever solved inside this app. Every problem card links directly out to `leetcode.com`. The app is purely a scheduler and tracker.

---

## Tech Stack

- **Framework**: Next.js (App Router) — deployed to Vercel
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres) — use the anon public key, RLS disabled, single hardcoded user, no auth
- **Language**: TypeScript throughout
- **No additional backend**: No API routes needed except a thin Supabase client. All logic runs client-side.

---

## Supabase Schema

Create exactly these two tables:

### `problems`
This is a static seed table. It never changes after initial seed.

```sql
create table problems (
  id text primary key, -- slugified problem name e.g. "two-sum"
  title text not null,
  leetcode_url text not null, -- full URL e.g. https://leetcode.com/problems/two-sum/
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  pattern text not null, -- e.g. "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked List", "Trees", "Tries", "Heap / Priority Queue", "Backtracking", "Graphs", "Advanced Graphs", "1D Dynamic Programming", "2D Dynamic Programming", "Greedy", "Intervals", "Math & Geometry", "Bit Manipulation"
  source text not null check (source in ('neetcode150', 'blind75', 'both')), -- "both" if appears in both lists
  interleave_group int not null -- integer 1-10, assigned to distribute problems across all patterns from day one (see Interleaving Logic section)
);
```

### `attempts`
Every time Kushal marks a problem done, insert a row. Never update or delete rows. This is the full history log.

```sql
create table attempts (
  id uuid primary key default gen_random_uuid(),
  problem_id text references problems(id),
  attempted_at timestamptz not null default now(),
  struggled boolean not null, -- true = struggled, false = didn't struggle
  personal_difficulty text not null check (personal_difficulty in ('Easy', 'Medium', 'Hard')), -- Kushal's own assessment, independent of LeetCode's label
  active_recall_question text not null, -- the question Kushal wrote himself after solving
  active_recall_answer text, -- nullable — Kushal fills this in on review sessions
  is_review boolean not null default false -- false = first attempt / new problem, true = this was a spaced repetition review session
);
```

---

## Problem Bank — Seed Data

Seed the `problems` table with the full merged NeetCode 150 + Blind 75 list. Deduplicate so problems appearing in both lists get `source = 'both'`. Every problem must have:
- Correct `leetcode_url` pointing to the real LeetCode problem page
- Correct `pattern` tag from the fixed list in the schema above
- An `interleave_group` integer from 1–10 (see Interleaving Logic below)

Do not truncate or abbreviate this list. All ~175 unique problems must be present after deduplication.

---

## Interleaving Logic

**Problem**: If problems are served in NeetCode pattern order (all Arrays first, then all Two Pointers, etc.), and the user stops halfway, they'll have deep coverage of early patterns and zero exposure to later ones like Graphs or DP.

**Solution**: Assign every problem an `interleave_group` integer from 1–10 during seeding. Assignment rules:
- Distribute problems so each group of 10 contains roughly one problem from each major pattern category.
- Think of it as dealing cards: go through all 18 pattern types round-robin and assign group 1, 2, 3... 10, 1, 2, 3... to each problem within the pattern.
- Within each pattern, order problems by ascending difficulty (Easy first, then Medium, then Hard) before assigning groups.

**How it's used at runtime**: When selecting new problems for today's session, always pick the lowest available `interleave_group` number that still has unseen problems. Within that group, pick randomly. This guarantees that after every 10 new problems Kushal does, he has touched every major pattern at least once.

---

## Scheduling Algorithm

This runs every time the app loads. It determines exactly which problems appear in today's session.

### Inputs
- `daily_count`: integer pulled from settings (default 5)
- Today's date

### Step 1 — Collect due reviews
A problem is **due for review** if ALL of the following are true:
1. Kushal has at least one attempt on it
2. His most recent attempt had `struggled = true`
3. The most recent attempt was at least 3 days ago (not 2, not 1 — exactly 3 or more)

Collect all due reviews. Sort by `attempted_at` ascending (oldest due review first).

### Step 2 — Calculate split
- `review_slots = min(due_reviews.length, floor(daily_count * 0.6))` — reviews get up to 60% of slots, never more
- `new_slots = daily_count - review_slots`

If there are zero due reviews, all slots are new problems.
If due reviews exceed 60% of daily_count, cap reviews at 60% and fill rest with new problems.

### Step 3 — Select new problems
A problem is **new** if it has zero attempts ever.
Select `new_slots` problems from the unseen pool using the interleave_group logic described above.

### Step 4 — Build today's session
Combine review problems + new problems into a single ordered list:
- Interleave them — don't front-load all reviews or all new problems
- Pattern: review, new, new, review, new (roughly alternating, reviews spread out)

This final list is what renders on screen.

---

## App Structure — Pages & Components

### Single page: `/` (Home)

The entire app lives on one page. No routing needed.

#### Layout sections (top to bottom):

**1. Header**
- App name (your choice, something clean)
- Today's date written out: "Monday, April 27"
- Settings icon (gear) in top right — opens settings panel

**2. Settings Panel** (hidden by default, toggled by gear icon)
- One input: "Problems per day" — number input, min 1, max 10, default 5
- Save button — persists to localStorage (settings don't need Supabase, they're device preference)
- Nothing else in settings

**3. Today's Session**
- Section header: "Today — N problems" where N is the actual count
- Renders the list of problem cards (see Problem Card below)
- If all problems for today are marked done: show a completion state ("Done for today. Come back tomorrow.")

**4. Stats Bar** (below today's session)
- Total problems attempted (unique problem_ids in attempts)
- Current streak (consecutive days with at least one attempt)
- Problems due for review tomorrow (preview count only, no list)

---

### Problem Card

Each card in today's session renders differently based on whether it's a new problem or a review.

#### New Problem Card
Shows:
- Problem title (bold)
- Pattern tag (subtle label, e.g. "Sliding Window")
- LeetCode difficulty badge: Easy (green) / Medium (yellow) / Hard (red)
- Source badge: "NeetCode 150", "Blind 75", or "Both"
- "Open on LeetCode" button — opens `leetcode_url` in a new tab
- "Mark Done" button — disabled until user has clicked "Open on LeetCode" at least once (enforce that they actually opened it)

When "Mark Done" is clicked:
- A modal/drawer appears inline (do not navigate away)
- Modal contains:
  - Title: "Log your attempt"
  - Struggle toggle: two buttons — "Struggled" / "Didn't Struggle" — one must be selected
  - Personal difficulty selector: "Easy" / "Medium" / "Hard" — one must be selected, default matches LeetCode difficulty
  - Active recall section with label: "Write a question about what you learned" — a textarea, required, min 10 characters
  - Hint text under textarea: "Example: 'What data structure makes this O(n) instead of O(n²)?'"
  - "Save" button — disabled until all three fields are filled
  - On save: insert row to `attempts`, mark card as complete, close modal

Completed card state:
- Visually distinct (muted, checkmark)
- Shows the active recall question Kushal just wrote (read-only, as a reminder)
- No further interaction

#### Review Problem Card
Shows everything the new card shows, plus:
- "Review" badge in top right corner of card
- Last attempted date: "Last done: 5 days ago"
- Active recall section visible directly on the card (not in modal):
  - Shows Kushal's own question from his last attempt: "Your question: [active_recall_question]"
  - A "Reveal your answer" toggle — clicking it shows `active_recall_answer` from that attempt if it exists, or "No answer recorded" if null
  - Self-assessment prompt: "Could you answer it?" — two buttons: "Yes" / "No" — must be selected before proceeding
- "Open on LeetCode" button (same behavior as new card)
- "Mark Done" button — same modal as new card, all same fields required

---

## Design Direction

This is a personal daily tool used every morning. Design it with a **dark, utilitarian, focused aesthetic** — like a well-designed terminal or a stripped-down dev dashboard. It should feel serious and frictionless, not playful.

Specific direction:
- Dark background (near-black, not pure #000)
- Monospaced or semi-monospaced display font for problem titles and headers — something with character, not generic (e.g. IBM Plex Mono, Geist Mono, Fira Code — pick one that feels refined)
- Clean sans-serif for body text and UI labels
- Accent color: a single sharp color for interactive elements (buttons, active states) — not blue, not purple. Consider amber, teal, or a warm off-white
- Cards should feel like rows in a well-designed CLI tool — structured, dense but not cluttered
- Difficulty badges use standard LeetCode colors (green/yellow/red) but muted to fit the dark theme
- Micro-animations on card completion (subtle slide or fade, nothing flashy)
- Mobile-responsive — it needs to look correct on a phone even though sessions happen on laptop

Do NOT use:
- Inter, Roboto, Arial, or system-ui as the primary font
- Purple gradients
- Rounded pill buttons (use sharp or slightly rounded corners)
- Any decorative illustrations or icons beyond simple functional ones

---

## State Management

All client state managed with React `useState` / `useEffect`. No Redux, no Zustand.

Key state:
- `todaySession: Problem[]` — computed once on load, never recomputed during the session unless page is refreshed
- `completedToday: Set<string>` — problem_ids marked done this session
- `settingsOpen: boolean`
- `activeModal: string | null` — problem_id of whichever card has the log modal open

---

## Data Fetching

- On app load: fetch today's session by running the scheduling algorithm against Supabase data
- Fetch all attempts for problems in today's session to determine review status and retrieve active recall questions
- All fetches happen in a single `useEffect` on mount
- Show a minimal loading state while fetching (just the header + a skeleton or spinner, nothing elaborate)
- After a problem is marked done: optimistically update UI, then insert to Supabase in background

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both must be set in Vercel project settings and in local `.env.local`.

---

## File Structure

```
/
├── app/
│   ├── page.tsx               -- main page, session rendering
│   ├── layout.tsx             -- root layout, fonts, global styles
│   └── globals.css            -- tailwind base + any custom CSS vars
├── components/
│   ├── ProblemCard.tsx        -- handles both new and review card rendering
│   ├── LogModal.tsx           -- the mark-done modal
│   ├── SettingsPanel.tsx      -- daily count input
│   └── StatsBar.tsx           -- streak, total, tomorrow count
├── lib/
│   ├── supabase.ts            -- supabase client init
│   ├── scheduler.ts           -- scheduling algorithm (pure function, takes attempts + problems, returns today's list)
│   └── problems.ts            -- full static problem bank as a TypeScript array (used for seeding and type reference)
├── types/
│   └── index.ts               -- Problem, Attempt, SessionProblem types
└── scripts/
    └── seed.ts                -- one-time script to seed problems table, run with `npx ts-node scripts/seed.ts`
```

---

## Explicit Non-Requirements (do not build these)

- No user authentication
- No ability to solve problems inside the app
- No company-tag filtering (v2)
- No notes editor beyond the active recall question/answer fields
- No graphs or analytics beyond the three stats in the stats bar
- No dark/light mode toggle (dark only)
- No PWA / service worker
- No timer or time tracking per problem

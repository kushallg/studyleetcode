import type { Problem, Attempt, SessionProblem } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// Stage-based spaced-repetition intervals (in days). Each clean solve / successful
// recall promotes one stage; struggling or failing recall resets to stage 0.
const INTERVALS_DAYS = [3, 7, 14, 30, 60];

function daysBetween(a: Date, b: Date): number {
  const da = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const db = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((db - da) / DAY_MS);
}

function isFailedAttempt(a: Attempt): boolean {
  if (a.struggled) return true;
  if (a.is_review && a.active_recall_answer && a.active_recall_answer.startsWith("No")) {
    return true;
  }
  return false;
}

function attemptsByProblem(attempts: Attempt[]): Map<string, Attempt[]> {
  const out = new Map<string, Attempt[]>();
  for (const a of attempts) {
    const arr = out.get(a.problem_id) ?? [];
    arr.push(a);
    out.set(a.problem_id, arr);
  }
  for (const arr of out.values()) {
    arr.sort((x, y) => +new Date(x.attempted_at) - +new Date(y.attempted_at));
  }
  return out;
}

// Walks a problem's attempt history to compute the next interval. Empty history
// returns -1 (problem is new, not a review candidate).
export function nextIntervalDays(history: Attempt[]): number {
  if (history.length === 0) return -1;
  let stage = 0;
  for (const a of history) {
    if (isFailedAttempt(a)) {
      stage = 0;
    } else {
      stage = Math.min(stage + 1, INTERVALS_DAYS.length - 1);
    }
  }
  return INTERVALS_DAYS[stage];
}

export interface BuildSessionInput {
  problems: Problem[];
  attempts: Attempt[];
  dailyCount: number;
  now?: Date;
}

export function buildTodaySession({
  problems,
  attempts,
  dailyCount,
  now = new Date(),
}: BuildSessionInput): SessionProblem[] {
  const byProblem = attemptsByProblem(attempts);
  const seenIds = new Set(byProblem.keys());

  // Step 1: due reviews — every previously-attempted problem is a review
  // candidate; the stage determines when it's due back.
  const dueReviews: { problem: Problem; lastAttempt: Attempt }[] = [];
  for (const p of problems) {
    const history = byProblem.get(p.id);
    if (!history || history.length === 0) continue;
    const last = history[history.length - 1];
    const interval = nextIntervalDays(history);
    if (daysBetween(new Date(last.attempted_at), now) < interval) continue;
    dueReviews.push({ problem: p, lastAttempt: last });
  }
  dueReviews.sort(
    (a, b) => new Date(a.lastAttempt.attempted_at).getTime() - new Date(b.lastAttempt.attempted_at).getTime()
  );

  // Step 2: split
  const reviewCap = Math.floor(dailyCount * 0.6);
  const reviewSlots = Math.min(dueReviews.length, reviewCap);
  const newSlots = dailyCount - reviewSlots;

  const reviewPicks = dueReviews.slice(0, reviewSlots);

  // Step 3: new problems via interleave_group
  const unseen = problems.filter((p) => !seenIds.has(p.id));
  const byGroup = new Map<number, Problem[]>();
  for (const p of unseen) {
    const arr = byGroup.get(p.interleave_group) ?? [];
    arr.push(p);
    byGroup.set(p.interleave_group, arr);
  }
  const groupKeys = [...byGroup.keys()].sort((a, b) => a - b);

  const newPicks: Problem[] = [];
  for (const g of groupKeys) {
    if (newPicks.length >= newSlots) break;
    const pool = [...(byGroup.get(g) ?? [])];
    while (pool.length && newPicks.length < newSlots) {
      const idx = Math.floor(Math.random() * pool.length);
      newPicks.push(pool.splice(idx, 1)[0]);
    }
  }

  // Step 4: interleave reviews and new (reviews spread out)
  const reviewSession: SessionProblem[] = reviewPicks.map((r) => ({
    problem: r.problem,
    isReview: true,
    lastAttempt: r.lastAttempt,
  }));
  const newSession: SessionProblem[] = newPicks.map((p) => ({ problem: p, isReview: false }));

  return interleave(reviewSession, newSession);
}

function interleave(reviews: SessionProblem[], news: SessionProblem[]): SessionProblem[] {
  const total = reviews.length + news.length;
  if (total === 0) return [];
  const out: SessionProblem[] = [];
  // Place reviews at evenly-spaced positions to spread them across the session.
  const reviewPositions = new Set<number>();
  if (reviews.length > 0) {
    const step = total / reviews.length;
    for (let i = 0; i < reviews.length; i++) {
      reviewPositions.add(Math.floor(i * step));
    }
  }
  let ri = 0;
  let ni = 0;
  for (let i = 0; i < total; i++) {
    if (reviewPositions.has(i) && ri < reviews.length) {
      out.push(reviews[ri++]);
    } else if (ni < news.length) {
      out.push(news[ni++]);
    } else if (ri < reviews.length) {
      out.push(reviews[ri++]);
    }
  }
  return out;
}

// Stats helpers used by StatsBar.
export function totalUniqueAttempted(attempts: Attempt[]): number {
  return new Set(attempts.map((a) => a.problem_id)).size;
}

export function currentStreak(attempts: Attempt[], now: Date = new Date()): number {
  if (attempts.length === 0) return 0;
  const days = new Set<string>();
  for (const a of attempts) {
    const d = new Date(a.attempted_at);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const cursor = new Date(now);
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow today to have no attempts yet — only break if streak already started.
      if (streak === 0 && daysBetween(cursor, now) === 0) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return streak;
}

export function dueTomorrowCount(
  problems: Problem[],
  attempts: Attempt[],
  now: Date = new Date()
): number {
  const byProblem = attemptsByProblem(attempts);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let count = 0;
  for (const p of problems) {
    const history = byProblem.get(p.id);
    if (!history || history.length === 0) continue;
    const last = history[history.length - 1];
    const interval = nextIntervalDays(history);
    if (daysBetween(new Date(last.attempted_at), tomorrow) >= interval) count += 1;
  }
  return count;
}

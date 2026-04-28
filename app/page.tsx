"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase, hasSupabaseConfig } from "@/lib/supabase";
import { PROBLEMS } from "@/lib/problems";
import {
  buildTodaySession,
  currentStreak,
  dueTomorrowCount,
  totalUniqueAttempted,
} from "@/lib/scheduler";
import type { Attempt, SessionProblem } from "@/types";
import ProblemCard from "@/components/ProblemCard";
import SettingsPanel from "@/components/SettingsPanel";
import StatsBar from "@/components/StatsBar";

const SETTINGS_KEY = "leetcode-daily.settings.v1";
const SESSION_KEY = "leetcode-daily.session.v1";

interface PersistedSession {
  date: string;
  ids: string[];
}

function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadSettings(): { dailyCount: number } {
  if (typeof window === "undefined") return { dailyCount: 5 };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { dailyCount: 5 };
    const parsed = JSON.parse(raw);
    return { dailyCount: parsed.dailyCount ?? 5 };
  } catch {
    return { dailyCount: 5 };
  }
}

function saveSettings(s: { dailyCount: number }) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadCachedSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function saveCachedSession(ids: string[]) {
  const payload: PersistedSession = { date: todayKey(), ids };
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [todaySession, setTodaySession] = useState<SessionProblem[]>([]);
  const [dailyCount, setDailyCount] = useState(5);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState<Map<string, Attempt>>(new Map());

  // Initial load.
  useEffect(() => {
    const settings = loadSettings();
    setDailyCount(settings.dailyCount);

    if (!hasSupabaseConfig()) {
      setError(
        "Supabase env vars not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local and restart the dev server."
      );
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error: err } = await getSupabase()
          .from("attempts")
          .select("*")
          .order("attempted_at", { ascending: true });
        if (err) throw err;
        const allAttempts = (data ?? []) as Attempt[];
        setAttempts(allAttempts);

        const cached = loadCachedSession();
        let session: SessionProblem[];
        if (cached && cached.date === todayKey() && cached.ids.length > 0) {
          // Rebuild from cached IDs to keep today's session stable.
          session = rebuildFromIds(cached.ids, allAttempts);
        } else {
          session = buildTodaySession({
            problems: PROBLEMS,
            attempts: allAttempts,
            dailyCount: settings.dailyCount,
          });
          saveCachedSession(session.map((s) => s.problem.id));
        }
        setTodaySession(session);

        // Mark anything already attempted today as complete.
        const todaysAttempts = allAttempts.filter(
          (a) => todayKey(new Date(a.attempted_at)) === todayKey()
        );
        const map = new Map<string, Attempt>();
        for (const a of todaysAttempts) map.set(a.problem_id, a);
        setCompletedToday(map);
      } catch (e: unknown) {
        setError(formatError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onComplete = async (
    session: SessionProblem,
    payload: {
      struggled: boolean;
      personal_difficulty: "Easy" | "Medium" | "Hard";
      active_recall_question: string;
      active_recall_answer: string | null;
      recall_succeeded: boolean | null;
    }
  ) => {
    const tempId = crypto.randomUUID();
    const attempt: Attempt = {
      id: tempId,
      problem_id: session.problem.id,
      attempted_at: new Date().toISOString(),
      struggled: payload.struggled,
      personal_difficulty: payload.personal_difficulty,
      active_recall_question: payload.active_recall_question,
      active_recall_answer: payload.active_recall_answer,
      recall_succeeded: session.isReview ? payload.recall_succeeded : null,
      is_review: session.isReview,
    };

    setCompletedToday((prev) => {
      const m = new Map(prev);
      m.set(attempt.problem_id, attempt);
      return m;
    });
    setAttempts((prev) => [...prev, attempt]);

    const { error: insertErr } = await getSupabase().from("attempts").insert({
      problem_id: attempt.problem_id,
      attempted_at: attempt.attempted_at,
      struggled: attempt.struggled,
      personal_difficulty: attempt.personal_difficulty,
      active_recall_question: attempt.active_recall_question,
      active_recall_answer: attempt.active_recall_answer,
      recall_succeeded: attempt.recall_succeeded,
      is_review: attempt.is_review,
    });
    if (insertErr) {
      setError(`Save failed: ${formatError(insertErr)}`);
    }
  };

  const onSaveSettings = (n: number) => {
    setDailyCount(n);
    saveSettings({ dailyCount: n });

    // Rebuild today's session for the new count, preserving anything completed.
    const completedItems = todaySession.filter((s) => completedToday.has(s.problem.id));
    const completedIds = new Set(completedItems.map((s) => s.problem.id));
    const fresh = buildTodaySession({
      problems: PROBLEMS,
      attempts,
      dailyCount: n,
    }).filter((s) => !completedIds.has(s.problem.id));
    const merged = [...completedItems, ...fresh].slice(
      0,
      Math.max(n, completedItems.length)
    );
    setTodaySession(merged);
    saveCachedSession(merged.map((s) => s.problem.id));

    setSettingsOpen(false);
  };

  const stats = useMemo(
    () => ({
      total: totalUniqueAttempted(attempts),
      streak: currentStreak(attempts),
      dueTomorrow: dueTomorrowCount(PROBLEMS, attempts),
    }),
    [attempts]
  );

  const allDone =
    todaySession.length > 0 && todaySession.every((s) => completedToday.has(s.problem.id));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="font-mono text-xl text-accent">daily.driver</div>
          <div className="mt-1 text-sm text-muted">{formatDate(new Date())}</div>
        </div>
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label="Settings"
          className="border border-border bg-panel p-2 text-muted hover:border-accentDim hover:text-ink"
        >
          <GearIcon />
        </button>
      </header>

      {settingsOpen && (
        <div className="mb-6">
          <SettingsPanel
            initial={dailyCount}
            onSave={onSaveSettings}
            onClose={() => setSettingsOpen(false)}
          />
        </div>
      )}

      {error && (
        <div className="mb-6 border border-hard/40 bg-panel p-3 font-mono text-sm text-hard">
          {error}
        </div>
      )}

      <section className="mb-8">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-mono text-sm uppercase tracking-wider text-muted">
            Today — {todaySession.length} problem{todaySession.length === 1 ? "" : "s"}
          </h2>
          <span className="font-mono text-xs text-faint">
            {completedToday.size}/{todaySession.length} done
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : todaySession.length === 0 ? (
          <Empty>No problems scheduled. Did you seed the database?</Empty>
        ) : allDone ? (
          <div className="border border-accentDim bg-panel p-6 text-center">
            <div className="font-mono text-lg text-accent">Done for today.</div>
            <div className="mt-1 text-sm text-muted">Come back tomorrow.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySession.map((s) => (
              <div key={s.problem.id} className="fade-in">
                <ProblemCard
                  session={s}
                  completedAttempt={completedToday.get(s.problem.id)}
                  onComplete={(payload) => onComplete(s, payload)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-muted">
          Stats
        </h2>
        <StatsBar
          totalAttempted={stats.total}
          streak={stats.streak}
          dueTomorrow={stats.dueTomorrow}
        />
      </section>

      <footer className="mt-12 text-center font-mono text-[10px] uppercase tracking-wider text-faint">
        one day at a time
      </footer>
    </div>
  );
}

function formatError(e: unknown): string {
  if (!e) return "Unknown error";
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (typeof e === "object") {
    const obj = e as Record<string, unknown>;
    const parts = [obj.message, obj.details, obj.hint, obj.code]
      .filter((v) => typeof v === "string" && v.length > 0);
    if (parts.length > 0) return parts.join(" — ");
    try {
      return JSON.stringify(e);
    } catch {
      return "Unknown error";
    }
  }
  return String(e);
}

function rebuildFromIds(ids: string[], attempts: Attempt[]): SessionProblem[] {
  const byId = new Map(PROBLEMS.map((p) => [p.id, p]));
  const latestByProblem = new Map<string, Attempt>();
  for (const a of attempts) {
    const cur = latestByProblem.get(a.problem_id);
    if (!cur || new Date(a.attempted_at) > new Date(cur.attempted_at)) {
      latestByProblem.set(a.problem_id, a);
    }
  }
  const out: SessionProblem[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) continue;
    const last = latestByProblem.get(id);
    const isReview = !!last;
    out.push({ problem: p, isReview, lastAttempt: isReview ? last : undefined });
  }
  return out;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function Skeleton() {
  return <div className="h-24 animate-pulse border border-border bg-panel" />;
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-panel p-6 text-center text-sm text-muted">
      {children}
    </div>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

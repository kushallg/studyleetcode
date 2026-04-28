"use client";

import { useState } from "react";
import type { Attempt, Difficulty, SessionProblem } from "@/types";
import LogModal, { LogPayload } from "./LogModal";

interface Props {
  session: SessionProblem;
  completedAttempt?: Attempt;
  onComplete: (payload: LogPayload & { reviewSelfAssessment: boolean | null }) => void;
}

export default function ProblemCard({ session, completedAttempt, onComplete }: Props) {
  const { problem, isReview, lastAttempt } = session;
  const [opened, setOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewAnswer, setReviewAnswer] = useState<boolean | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const isComplete = !!completedAttempt;
  const canMarkDone = opened && (!isReview || reviewAnswer !== null);

  const lastDoneLabel = lastAttempt ? formatRelative(lastAttempt.attempted_at) : null;

  return (
    <div
      className={
        "border bg-panel transition " +
        (isComplete
          ? "border-border/60 opacity-60"
          : "border-border hover:border-accentDim")
      }
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wider text-faint">
            <span>{problem.pattern}</span>
            <span>·</span>
            <SourceBadge source={problem.source} />
          </div>
          <div className="font-mono text-base text-ink">
            {isComplete && <span className="mr-2 text-accent">✓</span>}
            {problem.title}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isReview && (
            <span className="border border-accentDim px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              Review
            </span>
          )}
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </div>

      {isReview && lastAttempt && !isComplete && (
        <div className="mx-5 mt-4 border border-border/60 bg-panel2 p-3 text-sm">
          <div className="mb-1 text-xs uppercase tracking-wider text-faint">
            Last done {lastDoneLabel}
          </div>
          <div className="mb-2 font-mono text-ink">
            <span className="text-muted">Your question: </span>
            {lastAttempt.active_recall_question}
          </div>
          <button
            onClick={() => setRevealAnswer((v) => !v)}
            className="font-mono text-xs uppercase tracking-wider text-accent hover:underline"
          >
            {revealAnswer ? "Hide answer" : "Reveal your answer"}
          </button>
          {revealAnswer && (
            <div className="mt-2 border-l-2 border-accentDim pl-3 font-mono text-sm text-ink">
              {lastAttempt.active_recall_answer || (
                <span className="text-faint">No answer recorded</span>
              )}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted">
              Could you answer it?
            </span>
            <ToggleBtn
              active={reviewAnswer === true}
              onClick={() => setReviewAnswer(true)}
            >
              Yes
            </ToggleBtn>
            <ToggleBtn
              active={reviewAnswer === false}
              onClick={() => setReviewAnswer(false)}
            >
              No
            </ToggleBtn>
          </div>
        </div>
      )}

      {isComplete && completedAttempt && (
        <div className="mx-5 mb-4 mt-3 border-l-2 border-accentDim bg-panel2/50 px-3 py-2 font-mono text-sm text-muted">
          <div className="mb-1 text-xs uppercase tracking-wider text-faint">
            Your question
          </div>
          <div className="text-ink">{completedAttempt.active_recall_question}</div>
        </div>
      )}

      {!isComplete && (
        <div className="flex items-center gap-2 px-5 py-4">
          <a
            href={problem.leetcode_url}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpened(true)}
            className="border border-border bg-panel2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ink hover:border-accent hover:text-accent"
          >
            Open on LeetCode ↗
          </a>
          <button
            disabled={!canMarkDone}
            onClick={() => setModalOpen(true)}
            className="border border-accent bg-accent px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-bg disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-faint"
          >
            Mark Done
          </button>
          {!opened && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              open it first
            </span>
          )}
        </div>
      )}

      {modalOpen && (
        <LogModal
          problem={problem}
          onClose={() => setModalOpen(false)}
          onSave={(payload) => {
            setModalOpen(false);
            onComplete({ ...payload, reviewSelfAssessment: reviewAnswer });
          }}
        />
      )}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const cls =
    difficulty === "Easy"
      ? "text-easy border-easy/40"
      : difficulty === "Medium"
        ? "text-medium border-medium/40"
        : "text-hard border-hard/40";
  return (
    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${cls}`}>
      {difficulty}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const label =
    source === "neetcode150" ? "NeetCode 150" : source === "blind75" ? "Blind 75" : "Both";
  return <span>{label}</span>;
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "border px-2 py-1 font-mono text-xs uppercase tracking-wider " +
        (active
          ? "border-accent bg-accent text-bg"
          : "border-border bg-panel2 text-ink hover:border-accentDim")
      }
    >
      {children}
    </button>
  );
}

function formatRelative(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((+now - +then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

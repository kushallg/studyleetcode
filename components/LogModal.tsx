"use client";

import { useEffect, useState } from "react";
import type { Difficulty, Problem } from "@/types";

export interface LogPayload {
  struggled: boolean;
  personal_difficulty: Difficulty;
  active_recall_question: string;
}

interface Props {
  problem: Problem;
  onClose: () => void;
  onSave: (payload: LogPayload) => void;
}

export default function LogModal({ problem, onClose, onSave }: Props) {
  const [struggled, setStruggled] = useState<boolean | null>(null);
  const [personalDifficulty, setPersonalDifficulty] = useState<Difficulty>(problem.difficulty);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const valid = struggled !== null && question.trim().length >= 10;

  const handleSave = () => {
    if (!valid || struggled === null) return;
    onSave({
      struggled,
      personal_difficulty: personalDifficulty,
      active_recall_question: question.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-border bg-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-3 font-mono text-sm uppercase tracking-wider text-muted">
          Log your attempt
        </div>
        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Struggle</div>
            <div className="flex gap-2">
              <ToggleBtn active={struggled === true} onClick={() => setStruggled(true)}>
                Struggled
              </ToggleBtn>
              <ToggleBtn active={struggled === false} onClick={() => setStruggled(false)}>
                Didn&apos;t Struggle
              </ToggleBtn>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">
              Your difficulty rating
            </div>
            <div className="flex gap-2">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((d) => (
                <ToggleBtn
                  key={d}
                  active={personalDifficulty === d}
                  onClick={() => setPersonalDifficulty(d)}
                >
                  {d}
                </ToggleBtn>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-muted">
              Write a question about what you learned
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full border border-border bg-panel2 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
              placeholder="What's the key insight or trick?"
            />
            <div className="mt-1 text-xs text-faint">
              Example: &quot;What data structure makes this O(n) instead of O(n²)?&quot;
            </div>
            <div className="mt-1 text-xs text-faint">{question.trim().length}/10 min</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={handleSave}
            className="border border-accent bg-accent px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bg disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-faint"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
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
        "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition " +
        (active
          ? "border-accent bg-accent text-bg"
          : "border-border bg-panel2 text-ink hover:border-accentDim")
      }
    >
      {children}
    </button>
  );
}

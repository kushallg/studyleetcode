"use client";

import { useState } from "react";

interface Props {
  initial: number;
  onSave: (n: number) => void;
  onClose: () => void;
}

export default function SettingsPanel({ initial, onSave, onClose }: Props) {
  const [value, setValue] = useState(initial);
  return (
    <div className="border border-border bg-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="font-mono text-sm uppercase tracking-wider text-muted">Settings</div>
        <button
          onClick={onClose}
          className="font-mono text-xs uppercase tracking-wider text-muted hover:text-ink"
        >
          Close
        </button>
      </div>
      <div className="space-y-3 p-5">
        <label className="block">
          <div className="mb-2 text-xs uppercase tracking-wider text-muted">
            Problems per day
          </div>
          <input
            type="number"
            min={1}
            max={10}
            value={value}
            onChange={(e) => setValue(clamp(parseInt(e.target.value || "1", 10), 1, 10))}
            className="w-24 border border-border bg-panel2 px-3 py-2 font-mono text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <button
          onClick={() => onSave(value)}
          className="border border-accent bg-accent px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bg"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

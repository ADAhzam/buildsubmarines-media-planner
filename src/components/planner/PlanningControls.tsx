"use client";

import type { Strategy, DurationDays } from "@/lib/types";

interface PlanningControlsProps {
  budget: number;
  durationDays: DurationDays;
  strategy: Strategy;
  loading: boolean;
  canSubmit: boolean;
  onBudgetChange: (value: number) => void;
  onDurationChange: (days: DurationDays) => void;
  onStrategyChange: (strategy: Strategy) => void;
  onSubmit: () => void;
}

const DURATION_OPTIONS: DurationDays[] = [15, 30, 60, 90];

function ControlLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
      {children}
    </p>
  );
}

function fmt$(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PlanningControls({
  budget,
  durationDays,
  strategy,
  loading,
  canSubmit,
  onBudgetChange,
  onDurationChange,
  onStrategyChange,
  onSubmit,
}: PlanningControlsProps) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      {/* All groups use flex-col gap-2 so labels and controls share the same baseline grid */}
      <div className="flex flex-wrap items-start gap-x-6 gap-y-4">

        {/* ── Budget ───────────────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-1 min-w-52">
          <ControlLabel>Budget</ControlLabel>
          <div>
            <input
              type="number"
              min={10000}
              max={1000000}
              step={5000}
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="w-full h-9 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <input
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={budget}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              className="w-full accent-[var(--accent)] mt-2"
            />
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-0.5">
              <span>$10k</span>
              <span className="font-medium text-[var(--text-secondary)]">{fmt$(budget)}</span>
              <span>$1M</span>
            </div>
          </div>
        </div>

        {/* ── Campaign Duration ─────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <ControlLabel>Campaign Duration</ControlLabel>
          <div className="flex gap-1.5">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => onDurationChange(d)}
                className={`h-9 px-4 rounded-lg text-xs font-medium border transition-colors ${
                  durationDays === d
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* ── Delivery Strategy ─────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <ControlLabel>Delivery Strategy</ControlLabel>
          <div className="flex gap-1.5">
            {(["balanced", "aggressive"] as Strategy[]).map((s) => (
              <button
                key={s}
                onClick={() => onStrategyChange(s)}
                className={`h-9 px-4 rounded-lg text-xs font-medium border capitalize transition-colors ${
                  strategy === s
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Generate button ───────────────────────────────── */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Invisible label spacer — keeps button top-aligned with other controls */}
          <p className="text-xs invisible select-none" aria-hidden>_</p>
          <div>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="h-9 px-6 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
            >
              {loading ? "Generating…" : "Generate Media Plan"}
            </button>
            {!canSubmit && !loading && (
              <p className="text-xs text-[var(--text-muted)] mt-1.5 text-center whitespace-nowrap">
                Select specialties &amp; states first
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

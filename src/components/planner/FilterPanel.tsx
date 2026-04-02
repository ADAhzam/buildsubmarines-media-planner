"use client";

import type {
  JobFunctionOption,
  SpecialtyOption,
  StateOption,
  Strategy,
  DurationDays,
  BudgetMode,
} from "@/lib/types";

interface FilterPanelProps {
  // Reference data
  jobFunctions: JobFunctionOption[];
  allSpecialties: SpecialtyOption[];
  states: StateOption[];

  // Current selections
  selectedJobFunctions: string[];
  selectedSpecialties: string[];
  selectedStates: string[];
  budget: number;
  budgetMode: BudgetMode;
  durationDays: DurationDays;
  strategy: Strategy;
  loading: boolean;

  // Callbacks
  onJobFunctionsChange: (values: string[]) => void;
  onSpecialtiesChange: (values: string[]) => void;
  onStatesChange: (values: string[]) => void;
  onBudgetChange: (value: number) => void;
  onBudgetModeChange: (mode: BudgetMode) => void;
  onDurationChange: (days: DurationDays) => void;
  onStrategyChange: (strategy: Strategy) => void;
  onSubmit: () => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
      {children}
    </p>
  );
}

function CheckItem({
  label,
  checked,
  onChange,
  sub,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  sub?: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-3.5 w-3.5 rounded border-[var(--border-strong)] accent-[var(--accent)] flex-shrink-0"
      />
      <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] leading-tight">
        {label}
        {sub && (
          <span className="block text-xs text-[var(--text-muted)]">{sub}</span>
        )}
      </span>
    </label>
  );
}

const DURATION_OPTIONS: DurationDays[] = [15, 30, 60, 90];

export function FilterPanel({
  jobFunctions,
  allSpecialties,
  states,
  selectedJobFunctions,
  selectedSpecialties,
  selectedStates,
  budget,
  durationDays,
  strategy,
  loading,
  onJobFunctionsChange,
  onSpecialtiesChange,
  onStatesChange,
  onBudgetChange,
  onDurationChange,
  onStrategyChange,
  onSubmit,
}: FilterPanelProps) {
  // Filter specialties by selected job functions
  const visibleSpecialties =
    selectedJobFunctions.length > 0
      ? allSpecialties.filter((s) =>
          selectedJobFunctions.includes(s.jobFunction)
        )
      : allSpecialties;

  // Group states by hotspot cluster for display
  const clusterMap = new Map<string, StateOption[]>();
  for (const s of states) {
    const arr = clusterMap.get(s.hotspotCluster) ?? [];
    arr.push(s);
    clusterMap.set(s.hotspotCluster, arr);
  }
  // Sort clusters so hotspot ones come first
  const hotspotClusters = [
    "Pacific Defense Corridor",
    "Atlantic Naval Corridor",
    "Southern Manufacturing Belt",
    "Midwest Industrial Belt",
    "Northeast Advanced Manufacturing",
    "Other Regions",
  ];

  const canSubmit =
    !loading &&
    selectedSpecialties.length > 0 &&
    selectedStates.length > 0 &&
    budget >= 10000;

  return (
    <aside className="flex flex-col gap-5">
      {/* ── Job Functions ─────────────────────────────────── */}
      <section>
        <SectionLabel>Job Functions</SectionLabel>
        <div className="space-y-0.5">
          {jobFunctions.map((jf) => (
            <CheckItem
              key={jf.value}
              label={jf.label}
              checked={selectedJobFunctions.includes(jf.value)}
              onChange={() =>
                onJobFunctionsChange(toggle(selectedJobFunctions, jf.value))
              }
            />
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* ── Specialties ───────────────────────────────────── */}
      <section>
        <SectionLabel>
          Specialties
          {selectedJobFunctions.length > 0 &&
            ` (${visibleSpecialties.length})`}
        </SectionLabel>
        {selectedJobFunctions.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] mb-2">
            Select job functions above to filter.
          </p>
        )}
        <div className="space-y-0.5">
          {visibleSpecialties.map((sp) => (
            <CheckItem
              key={sp.value}
              label={sp.label}
              sub={sp.difficultyTier !== "Low" ? `${sp.difficultyTier} difficulty` : undefined}
              checked={selectedSpecialties.includes(sp.value)}
              onChange={() =>
                onSpecialtiesChange(toggle(selectedSpecialties, sp.value))
              }
            />
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* ── Hotspots / States ─────────────────────────────── */}
      <section>
        <SectionLabel>Hotspots / States</SectionLabel>
        <div className="space-y-4">
          {hotspotClusters.map((cluster) => {
            const clusterStates = clusterMap.get(cluster);
            if (!clusterStates || clusterStates.length === 0) return null;
            return (
              <div key={cluster}>
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                  {cluster}
                </p>
                <div className="space-y-0.5 pl-1">
                  {clusterStates.map((s) => (
                    <CheckItem
                      key={s.value}
                      label={s.label}
                      checked={selectedStates.includes(s.value)}
                      onChange={() =>
                        onStatesChange(toggle(selectedStates, s.value))
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* ── Budget ────────────────────────────────────────── */}
      <section>
        <SectionLabel>Budget</SectionLabel>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-[var(--text-secondary)]">$</span>
          <input
            type="number"
            min={10000}
            max={1000000}
            step={5000}
            value={budget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <input
          type="range"
          min={10000}
          max={1000000}
          step={5000}
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
          <span>$10k</span>
          <span>$1M</span>
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* ── Duration ──────────────────────────────────────── */}
      <section>
        <SectionLabel>Flight Duration</SectionLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onDurationChange(d)}
              className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                durationDays === d
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-[var(--border)]" />

      {/* ── Delivery Strategy ─────────────────────────────── */}
      <section>
        <SectionLabel>Delivery Strategy</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {(["balanced", "aggressive"] as Strategy[]).map((s) => (
            <button
              key={s}
              onClick={() => onStrategyChange(s)}
              className={`py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                strategy === s
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ── Generate button ───────────────────────────────── */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="mt-1 w-full py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent-hover)] transition-colors"
      >
        {loading ? "Generating…" : "Generate Media Plan"}
      </button>

      {selectedSpecialties.length === 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center -mt-3">
          Select at least one specialty and state.
        </p>
      )}
    </aside>
  );
}

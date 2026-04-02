"use client";

import type {
  JobFunctionOption,
  SpecialtyOption,
  StateOption,
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

  // Callbacks
  onJobFunctionsChange: (values: string[]) => void;
  onSpecialtiesChange: (values: string[]) => void;
  onStatesChange: (values: string[]) => void;
}

function toggle(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function SectionHeader({
  children,
  onSelectAll,
  onClear,
}: {
  children: React.ReactNode;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        {children}
      </p>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onSelectAll}
          className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors px-1.5 py-0.5 rounded"
        >
          All
        </button>
        <button
          type="button"
          onClick={onClear}
          title="Clear selection"
          className="flex items-center justify-center w-5 h-5 rounded text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--red-bg)] transition-colors"
        >
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
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

const hotspotClusters = [
  "Pacific Defense Corridor",
  "Atlantic Naval Corridor",
  "Southern Manufacturing Belt",
  "Midwest Industrial Belt",
  "Northeast Advanced Manufacturing",
  "Other Regions",
];

export function FilterPanel({
  jobFunctions,
  allSpecialties,
  states,
  selectedJobFunctions,
  selectedSpecialties,
  selectedStates,
  onJobFunctionsChange,
  onSpecialtiesChange,
  onStatesChange,
}: FilterPanelProps) {
  const visibleSpecialties =
    selectedJobFunctions.length > 0
      ? allSpecialties.filter((s) => selectedJobFunctions.includes(s.jobFunction))
      : allSpecialties;

  const clusterMap = new Map<string, StateOption[]>();
  for (const s of states) {
    const arr = clusterMap.get(s.hotspotCluster) ?? [];
    arr.push(s);
    clusterMap.set(s.hotspotCluster, arr);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Job Functions ─────────────────────────────────── */}
      <section>
        <SectionHeader
          onSelectAll={() => onJobFunctionsChange(jobFunctions.map((jf) => jf.value))}
          onClear={() => onJobFunctionsChange([])}
        >
          Job Functions
        </SectionHeader>
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
        <SectionHeader
          onSelectAll={() => onSpecialtiesChange(visibleSpecialties.map((sp) => sp.value))}
          onClear={() => onSpecialtiesChange([])}
        >
          Specialties
          {selectedJobFunctions.length > 0 && ` (${visibleSpecialties.length})`}
        </SectionHeader>
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
        <SectionHeader
          onSelectAll={() => onStatesChange(states.map((s) => s.value))}
          onClear={() => onStatesChange([])}
        >
          Hotspots / States
        </SectionHeader>
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
    </div>
  );
}

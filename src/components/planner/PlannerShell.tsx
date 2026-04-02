"use client";

import { useState, useCallback, useRef } from "react";
import type {
  ReferenceData,
  PlanResult,
  PlannerInputs,
  Strategy,
  DurationDays,
  BudgetMode,
  PresetScenario,
} from "@/lib/types";
import { FilterPanel } from "./FilterPanel";
import { PlanningControls } from "./PlanningControls";
import { SummaryBar } from "@/components/ui/SummaryBar";
import { MediaPlanTable } from "@/components/ui/MediaPlanTable";
import { InsightCards } from "@/components/ui/InsightCards";

interface PlannerShellProps {
  reference: ReferenceData;
  presets: PresetScenario[];
}

export function PlannerShell({ reference, presets }: PlannerShellProps) {
  // ── Portfolio selection state ────────────────────────────────────────────────
  const [selectedJobFunctions, setSelectedJobFunctions] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  // Tracks states the user has manually unchecked so cascades don't re-select them
  const manuallyDeselectedStates = useRef<Set<string>>(new Set());

  // ── Planning controls state ──────────────────────────────────────────────────
  const [budget, setBudget] = useState<number>(100000);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("user");
  const [durationDays, setDurationDays] = useState<DurationDays>(30);
  const [strategy, setStrategy] = useState<Strategy>("balanced");

  // ── Results state ────────────────────────────────────────────────────────────
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !loading &&
    selectedSpecialties.length > 0 &&
    selectedStates.length > 0 &&
    budget >= 10000;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // Returns all state codes covered by a set of specialty values
  function statesForSpecialties(specialtyValues: string[]): string[] {
    const result = new Set<string>();
    for (const sp of specialtyValues) {
      for (const state of reference.specialtyStates[sp] ?? []) {
        result.add(state);
      }
    }
    return Array.from(result);
  }

  // Derives which states should be auto-selected given the current specialty set,
  // respecting any states the user has manually deselected.
  function cascadeStates(nextSpecialties: string[], prevStates: string[]): string[] {
    const covered = new Set(statesForSpecialties(nextSpecialties));
    // Keep manually-selected states that are still covered
    const next = prevStates.filter((s) => {
      // Always drop states no longer covered by any specialty
      if (!covered.has(s)) return false;
      return true;
    });
    // Add newly-covered states that weren't manually deselected
    for (const state of covered) {
      if (!next.includes(state) && !manuallyDeselectedStates.current.has(state)) {
        next.push(state);
      }
    }
    return next;
  }

  // ── Job function change ───────────────────────────────────────────────────────
  function handleJobFunctionsChange(nextJFs: string[]) {
    const added = nextJFs.filter((jf) => !selectedJobFunctions.includes(jf));
    const removed = selectedJobFunctions.filter((jf) => !nextJFs.includes(jf));

    setSelectedJobFunctions(nextJFs);

    setSelectedSpecialties((prevSpecialties) => {
      let nextSpecialties = [...prevSpecialties];

      // Auto-add specialties for each newly selected JF
      for (const jf of added) {
        const toAdd = reference.specialties
          .filter((s) => s.jobFunction === jf)
          .map((s) => s.value);
        for (const sp of toAdd) {
          if (!nextSpecialties.includes(sp)) nextSpecialties.push(sp);
        }
      }

      // Remove specialties that belonged only to a removed JF
      for (const jf of removed) {
        const ownedByRemoved = new Set(
          reference.specialties.filter((s) => s.jobFunction === jf).map((s) => s.value)
        );
        nextSpecialties = nextSpecialties.filter((sp) => {
          if (!ownedByRemoved.has(sp)) return true;
          // Keep if it also belongs to a still-selected JF
          return nextJFs.some((remainingJF) =>
            reference.specialties.some(
              (s) => s.value === sp && s.jobFunction === remainingJF
            )
          );
        });
      }

      // When a JF is re-toggled, clear manual-deselect memory for its states
      // so the cascade can re-select them fresh
      for (const jf of added) {
        const jfSpecialties = reference.specialties
          .filter((s) => s.jobFunction === jf)
          .map((s) => s.value);
        for (const state of statesForSpecialties(jfSpecialties)) {
          manuallyDeselectedStates.current.delete(state);
        }
      }

      setSelectedStates((prevStates) => cascadeStates(nextSpecialties, prevStates));
      return nextSpecialties;
    });
  }

  // ── Specialty change ──────────────────────────────────────────────────────────
  function handleSpecialtiesChange(nextSpecialties: string[]) {
    const added = nextSpecialties.filter((sp) => !selectedSpecialties.includes(sp));

    // When a specialty is re-added, clear manual-deselect memory for its states
    for (const sp of added) {
      for (const state of reference.specialtyStates[sp] ?? []) {
        manuallyDeselectedStates.current.delete(state);
      }
    }

    setSelectedSpecialties(nextSpecialties);
    setSelectedStates((prevStates) => cascadeStates(nextSpecialties, prevStates));
  }

  // ── State change (manual) ─────────────────────────────────────────────────────
  function handleStatesChange(nextStates: string[]) {
    // Detect manually deselected states and remember them
    const removed = selectedStates.filter((s) => !nextStates.includes(s));
    for (const s of removed) manuallyDeselectedStates.current.add(s);
    // Detect manually added states and forget any prior deselect memory
    const added = nextStates.filter((s) => !selectedStates.includes(s));
    for (const s of added) manuallyDeselectedStates.current.delete(s);

    setSelectedStates(nextStates);
  }

  // ── Load preset ───────────────────────────────────────────────────────────────
  function loadPreset(preset: PresetScenario) {
    const { inputs } = preset;
    manuallyDeselectedStates.current.clear();
    setSelectedJobFunctions(inputs.jobFunctions);
    setSelectedSpecialties(inputs.specialties);
    setSelectedStates(inputs.states);
    setBudget(inputs.budget);
    setBudgetMode(inputs.budgetMode);
    setDurationDays(inputs.durationDays);
    setStrategy(inputs.strategy);
    setResult(null);
    setError(null);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);

    const inputs: PlannerInputs = {
      jobFunctions: selectedJobFunctions,
      specialties: selectedSpecialties,
      states: selectedStates,
      budget,
      budgetMode,
      durationDays,
      strategy,
    };

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data as PlanResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedJobFunctions,
    selectedSpecialties,
    selectedStates,
    budget,
    budgetMode,
    durationDays,
    strategy,
  ]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            BuildSubmarines Media Planner
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Powered by Joveo planning intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)] mr-1 hidden sm:inline">
            Presets:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              title={preset.description}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left sidebar: portfolio filters ─────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
            Job Portfolio
          </p>
          <FilterPanel
            jobFunctions={reference.jobFunctions}
            allSpecialties={reference.specialties}
            states={reference.states}
            selectedJobFunctions={selectedJobFunctions}
            selectedSpecialties={selectedSpecialties}
            selectedStates={selectedStates}
            onJobFunctionsChange={handleJobFunctionsChange}
            onSpecialtiesChange={handleSpecialtiesChange}
            onStatesChange={handleStatesChange}
          />
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Planning controls */}
            <PlanningControls
              budget={budget}
              durationDays={durationDays}
              strategy={strategy}
              loading={loading}
              canSubmit={canSubmit}
              onBudgetChange={setBudget}
              onDurationChange={setDurationDays}
              onStrategyChange={setStrategy}
              onSubmit={handleSubmit}
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-[var(--red-bg)] border border-red-200 px-4 py-3 text-sm text-[var(--red)]">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[var(--border-strong)] border-t-[var(--accent)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-muted)]">
                    Computing media plan…
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && <EmptyState />}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-8">
                <section>
                  <SectionHeading>Executive Summary</SectionHeading>
                  <SummaryBar summary={result.summary} />
                </section>

                <section>
                  <SectionHeading>
                    Media Plan
                    <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                      Click a row to expand by specialty
                    </span>
                  </SectionHeading>
                  <MediaPlanTable groups={result.groups} />
                </section>

                {(result.insights.length > 0 || result.topPublishers.length > 0) && (
                  <section>
                    <SectionHeading>Strategic Insights</SectionHeading>
                    <InsightCards
                      insights={result.insights}
                      topPublishers={result.topPublishers}
                    />
                  </section>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
      {children}
    </h2>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xl text-[var(--text-muted)]">
        ◈
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No plan generated yet
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
          Select your job portfolio on the left, configure your plan settings
          above, then click &ldquo;Generate Media Plan&rdquo;.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
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
import { SummaryBar } from "@/components/ui/SummaryBar";
import { MediaPlanTable } from "@/components/ui/MediaPlanTable";
import { InsightCards } from "@/components/ui/InsightCards";

interface PlannerShellProps {
  reference: ReferenceData;
  presets: PresetScenario[];
}

export function PlannerShell({ reference, presets }: PlannerShellProps) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedJobFunctions, setSelectedJobFunctions] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(100000);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("user");
  const [durationDays, setDurationDays] = useState<DurationDays>(30);
  const [strategy, setStrategy] = useState<Strategy>("balanced");

  // ── Results state ───────────────────────────────────────────────────────────
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Job function change cascades specialty deselection ───────────────────────
  function handleJobFunctionsChange(values: string[]) {
    setSelectedJobFunctions(values);
    // Drop any specialty that no longer belongs to a selected job function
    if (values.length > 0) {
      setSelectedSpecialties((prev) =>
        prev.filter((sp) =>
          reference.specialties.some(
            (s) => s.value === sp && values.includes(s.jobFunction)
          )
        )
      );
    }
  }

  // ── Load preset ─────────────────────────────────────────────────────────────
  function loadPreset(preset: PresetScenario) {
    const { inputs } = preset;
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

  // ── Submit ──────────────────────────────────────────────────────────────────
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
    <div className="flex flex-col flex-1">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            BuildSubmarines Media Planner
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Powered by Joveo planning intelligence
          </p>
        </div>
        {/* Preset scenarios */}
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

      {/* ── Main layout ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter sidebar */}
        <aside className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] overflow-y-auto p-5">
          <FilterPanel
            jobFunctions={reference.jobFunctions}
            allSpecialties={reference.specialties}
            states={reference.states}
            selectedJobFunctions={selectedJobFunctions}
            selectedSpecialties={selectedSpecialties}
            selectedStates={selectedStates}
            budget={budget}
            budgetMode={budgetMode}
            durationDays={durationDays}
            strategy={strategy}
            loading={loading}
            onJobFunctionsChange={handleJobFunctionsChange}
            onSpecialtiesChange={setSelectedSpecialties}
            onStatesChange={setSelectedStates}
            onBudgetChange={setBudget}
            onBudgetModeChange={setBudgetMode}
            onDurationChange={setDurationDays}
            onStrategyChange={setStrategy}
            onSubmit={handleSubmit}
          />
        </aside>

        {/* Results panel */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-[var(--red-bg)] border border-red-200 px-4 py-3 text-sm text-[var(--red)]">
              {error}
            </div>
          )}

          {!result && !loading && (
            <EmptyState />
          )}

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

          {result && !loading && (
            <div className="space-y-8">
              {/* Executive Summary */}
              <section>
                <SectionHeading>Executive Summary</SectionHeading>
                <SummaryBar summary={result.summary} />
              </section>

              {/* Media Plan Table */}
              <section>
                <SectionHeading>
                  Media Plan
                  <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                    Click a row to expand by specialty
                  </span>
                </SectionHeading>
                <MediaPlanTable groups={result.groups} />
              </section>

              {/* Insights */}
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
    <div className="flex flex-col items-center justify-center h-full min-h-72 text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-xl text-[var(--text-muted)]">
        ◈
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No plan generated yet
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
          Select job functions, specialties, states, and a budget, then click
          &ldquo;Generate Media Plan&rdquo; — or load a preset to get started.
        </p>
      </div>
    </div>
  );
}

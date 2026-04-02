"use client";

import { useState } from "react";
import type { MediaPlanGroup, MediaPlanRow } from "@/lib/types";
import { Badge } from "./Badge";

interface MediaPlanTableProps {
  groups: MediaPlanGroup[];
}

interface RollupRow {
  specialty: string;
  locations: string[];
  spend: number;
  applyStarts: number;
  cpas: number;
  difficultyTier: string;
}

function rollupBySpecialty(rows: MediaPlanRow[]): RollupRow[] {
  const map = new Map<string, RollupRow>();
  for (const row of rows) {
    const existing = map.get(row.specialty);
    if (!existing) {
      map.set(row.specialty, {
        specialty: row.specialty,
        locations: [row.stateName],
        spend: row.spend,
        applyStarts: row.applyStarts,
        cpas: 0,
        difficultyTier: row.difficultyTier,
      });
    } else {
      if (!existing.locations.includes(row.stateName)) existing.locations.push(row.stateName);
      existing.spend += row.spend;
      existing.applyStarts += row.applyStarts;
    }
  }
  for (const r of map.values()) {
    r.cpas = r.applyStarts > 0 ? r.spend / r.applyStarts : 0;
  }
  return Array.from(map.values());
}

function fmt$(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function difficultyVariant(tier: string): "green" | "amber" | "red" | "neutral" {
  if (tier === "Low") return "green";
  if (tier === "High" || tier === "Very High") return "red";
  return "neutral";
}

// Shared column definition — used on EVERY row so numeric columns always align.
// Campaign rows span cols 1–2 for the name; specialty rows use all 5.
const COLS = "grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_112px_80px_108px]";

const LOCATION_TRUNCATE = 55;

function LocationCell({ locations }: { locations: string[] }) {
  const full = locations.join(", ");
  const display = full.length > LOCATION_TRUNCATE ? full.slice(0, LOCATION_TRUNCATE).trimEnd() + "…" : full;
  return (
    <span
      className="text-sm text-[var(--text-secondary)] leading-snug"
      title={full.length > LOCATION_TRUNCATE ? full : undefined}
    >
      {display}
    </span>
  );
}

export function MediaPlanTable({ groups }: MediaPlanTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(jf: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(jf)) next.delete(jf);
      else next.add(jf);
      return next;
    });
  }

  if (groups.length === 0) {
    return (
      <div className="border border-[var(--border)] rounded-xl p-8 text-center text-[var(--text-muted)] text-sm">
        No planning data returned for this combination. Try adjusting your specialties or states.
      </div>
    );
  }

  const grandSpend = groups.reduce((s, g) => s + g.totalSpend, 0);
  const grandApplies = groups.reduce((s, g) => s + g.totalApplyStarts, 0);
  const grandCpas = grandApplies > 0 ? grandSpend / grandApplies : 0;

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">

      {/* ── Main header — 5-col grid ─────────────────────────────── */}
      <div className={`grid ${COLS} gap-x-3 px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]`}>
        <span className="col-span-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Campaign / Job Function
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">Spend</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">CPAS</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">Apply Starts</span>
      </div>

      {/* ── Groups ───────────────────────────────────────────────── */}
      {groups.map((group) => {
        const isOpen = expanded.has(group.jobFunction);
        const rollups = rollupBySpecialty(group.rows);

        return (
          <div key={group.jobFunction} className="border-b border-[var(--border)] last:border-b-0">

            {/* Campaign row — name spans cols 1–2 */}
            <button
              onClick={() => toggle(group.jobFunction)}
              className={`w-full grid ${COLS} gap-x-3 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors text-left items-center`}
            >
              <span className="col-span-2 flex items-center gap-2 font-medium text-sm text-[var(--text-primary)] min-w-0">
                <svg
                  className={`w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="truncate">{group.jobFunction}</span>
                <span className="text-xs text-[var(--text-muted)] font-normal whitespace-nowrap">
                  ({rollups.length} {rollups.length === 1 ? "specialty" : "specialties"})
                </span>
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right tabular-nums">
                {fmt$(group.totalSpend)}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right tabular-nums">
                ${group.avgCpas.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right tabular-nums">
                {fmtNum(group.totalApplyStarts)}
              </span>
            </button>

            {/* ── Expanded specialty rows ───────────────────────── */}
            {isOpen && (
              <div className="border-t border-[var(--border)] bg-[var(--bg)]">

                {/* Specialty sub-header — all 5 cols */}
                <div className={`grid ${COLS} gap-x-3 px-4 py-2 border-b border-[var(--border)]`}>
                  <span className="text-xs text-[var(--text-muted)]">Specialty</span>
                  <span className="text-xs text-[var(--text-muted)]">Locations</span>
                  <span className="text-xs text-[var(--text-muted)] text-right">Spend</span>
                  <span className="text-xs text-[var(--text-muted)] text-right">CPAS</span>
                  <span className="text-xs text-[var(--text-muted)] text-right">Apply Starts</span>
                </div>

                {rollups.map((rollup) => (
                  <div
                    key={rollup.specialty}
                    className={`grid ${COLS} gap-x-3 px-4 py-2.5 border-b border-[var(--border)] last:border-b-0 items-center`}
                  >
                    {/* Specialty + difficulty badge */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-[var(--text-primary)] whitespace-nowrap">
                        {rollup.specialty}
                      </span>
                      <Badge variant={difficultyVariant(rollup.difficultyTier)}>
                        {rollup.difficultyTier}
                      </Badge>
                    </div>
                    {/* Locations */}
                    <LocationCell locations={rollup.locations} />
                    {/* Spend */}
                    <span className="text-sm text-[var(--text-secondary)] text-right tabular-nums">
                      {fmt$(rollup.spend)}
                    </span>
                    {/* CPAS */}
                    <span className="text-sm text-[var(--text-secondary)] text-right tabular-nums">
                      ${rollup.cpas.toFixed(2)}
                    </span>
                    {/* Apply Starts */}
                    <span className="text-sm text-[var(--text-secondary)] text-right tabular-nums">
                      {fmtNum(rollup.applyStarts)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Totals footer — name spans cols 1–2 ─────────────────── */}
      <div className={`grid ${COLS} gap-x-3 px-4 py-3 bg-[var(--surface-2)] border-t border-[var(--border)] items-center`}>
        <span className="col-span-2 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Total
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right tabular-nums">
          {fmt$(grandSpend)}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right tabular-nums">
          ${grandCpas.toFixed(2)}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right tabular-nums">
          {fmtNum(grandApplies)}
        </span>
      </div>
    </div>
  );
}

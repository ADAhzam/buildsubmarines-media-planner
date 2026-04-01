"use client";

import { useState } from "react";
import type { MediaPlanGroup } from "@/lib/types";
import { Badge } from "./Badge";

interface MediaPlanTableProps {
  groups: MediaPlanGroup[];
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

function difficultyVariant(
  tier: string
): "green" | "amber" | "red" | "neutral" {
  if (tier === "Low") return "green";
  if (tier === "High") return "red";
  return "neutral";
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
        No planning data returned for this combination. Try adjusting your
        specialties or states.
      </div>
    );
  }

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_120px_90px_90px] gap-x-4 px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Campaign / Job Function
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">
          Spend
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">
          CPAS
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] text-right">
          Applies
        </span>
      </div>

      {/* Groups */}
      {groups.map((group) => {
        const isOpen = expanded.has(group.jobFunction);
        return (
          <div key={group.jobFunction} className="border-b border-[var(--border)] last:border-b-0">
            {/* Group row */}
            <button
              onClick={() => toggle(group.jobFunction)}
              className="w-full grid grid-cols-[1fr_120px_90px_90px] gap-x-4 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors text-left"
            >
              <span className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
                <svg
                  className={`w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {group.jobFunction}
                <span className="text-xs text-[var(--text-muted)] font-normal">
                  ({group.rows.length} {group.rows.length === 1 ? "line" : "lines"})
                </span>
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right">
                {fmt$(group.totalSpend)}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right">
                ${group.avgCpas.toFixed(2)}
              </span>
              <span className="text-sm font-semibold text-[var(--text-primary)] text-right">
                {fmtNum(group.totalApplyStarts)}
              </span>
            </button>

            {/* Specialty rows */}
            {isOpen && (
              <div className="border-t border-[var(--border)] bg-[var(--bg)]">
                {/* Sub-header */}
                <div className="grid grid-cols-[1fr_120px_90px_90px] gap-x-4 px-8 py-2 border-b border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)]">
                    Specialty / Location
                  </span>
                  <span className="text-xs text-[var(--text-muted)] text-right">Spend</span>
                  <span className="text-xs text-[var(--text-muted)] text-right">CPAS</span>
                  <span className="text-xs text-[var(--text-muted)] text-right">Applies</span>
                </div>
                {group.rows.map((row, i) => (
                  <div
                    key={`${row.specialty}-${row.state}-${i}`}
                    className="grid grid-cols-[1fr_120px_90px_90px] gap-x-4 px-8 py-2.5 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div>
                        <p className="text-sm text-[var(--text-primary)] truncate">
                          {row.specialty}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {row.stateName} · {row.hotspotCluster}
                        </p>
                      </div>
                      <Badge variant={difficultyVariant(row.difficultyTier)}>
                        {row.difficultyTier}
                      </Badge>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] text-right self-center">
                      {fmt$(row.spend)}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)] text-right self-center">
                      ${row.cpas.toFixed(2)}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)] text-right self-center">
                      {fmtNum(row.applyStarts)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Totals footer */}
      <div className="grid grid-cols-[1fr_120px_90px_90px] gap-x-4 px-4 py-3 bg-[var(--surface-2)] border-t border-[var(--border)]">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Total
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right">
          {fmt$(groups.reduce((s, g) => s + g.totalSpend, 0))}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right">
          ${(
            groups.reduce((s, g) => s + g.totalSpend, 0) /
            Math.max(groups.reduce((s, g) => s + g.totalApplyStarts, 0), 1)
          ).toFixed(2)}
        </span>
        <span className="text-sm font-bold text-[var(--text-primary)] text-right">
          {fmtNum(groups.reduce((s, g) => s + g.totalApplyStarts, 0))}
        </span>
      </div>
    </div>
  );
}

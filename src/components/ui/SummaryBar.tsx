import type { PlanSummary } from "@/lib/types";
import { Card, CardLabel } from "./Card";
import { Badge } from "./Badge";

interface SummaryBarProps {
  summary: PlanSummary;
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

export function SummaryBar({ summary }: SummaryBarProps) {
  const cpasVariant =
    summary.avgCpas > 3.6
      ? "amber"
      : summary.avgCpas < 3.0
      ? "green"
      : "neutral";

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardLabel>Total Budget</CardLabel>
          <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {fmt$(summary.totalBudget)}
          </p>
        </Card>

        <Card>
          <CardLabel>Est. Apply Starts</CardLabel>
          <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {fmtNum(summary.totalApplyStarts)}
          </p>
        </Card>

        <Card>
          <CardLabel>Avg CPAS</CardLabel>
          <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            ${summary.avgCpas.toFixed(2)}
          </p>
          <Badge variant={cpasVariant}>
            {cpasVariant === "green"
              ? "Below benchmark"
              : cpasVariant === "amber"
              ? "Above benchmark"
              : "On target"}
          </Badge>
        </Card>

        <Card>
          <CardLabel>Delivery Strategy</CardLabel>
          <p className="text-2xl font-semibold tracking-tight capitalize text-[var(--text-primary)]">
            {summary.strategy}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {summary.durationDays}-day flight
          </p>
        </Card>
      </div>

      {/* Opportunity + Risk */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="flex gap-3 items-start">
          <div className="flex-shrink-0 mt-0.5 w-1.5 h-full min-h-[20px] rounded-full bg-[var(--green)]" />
          <div>
            <CardLabel>Top Opportunity</CardLabel>
            <p className="text-sm text-[var(--text-primary)] leading-relaxed">
              {summary.topOpportunity}
            </p>
          </div>
        </Card>

        {summary.riskFlag ? (
          <Card className="flex gap-3 items-start">
            <div className="flex-shrink-0 mt-0.5 w-1.5 h-full min-h-[20px] rounded-full bg-[var(--amber)]" />
            <div>
              <CardLabel>Risk Flag</CardLabel>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {summary.riskFlag}
              </p>
            </div>
          </Card>
        ) : (
          <Card className="flex gap-3 items-start">
            <div className="flex-shrink-0 mt-0.5 w-1.5 h-full min-h-[20px] rounded-full bg-[var(--green)]" />
            <div>
              <CardLabel>Risk Flag</CardLabel>
              <p className="text-sm text-[var(--text-muted)]">
                No material risks identified.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

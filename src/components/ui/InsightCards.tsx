import type { InsightCard, InsightFamily } from "@/lib/types";
import { Card, CardLabel } from "./Card";

interface InsightCardsProps {
  insights: InsightCard[];
  topPublishers: string[];
}

const FAMILY_ICON: Record<InsightFamily | string, string> = {
  cost_driver: "◈",
  location: "◎",
  location_expansion: "→",
  hard_to_fill: "▲",
  portfolio: "◻",
  title: "✦",
};

const FAMILY_COLOR: Record<InsightFamily | string, string> = {
  cost_driver: "text-[var(--blue)] bg-[var(--blue-bg)]",
  location: "text-[var(--green)] bg-[var(--green-bg)]",
  location_expansion: "text-[var(--green)] bg-[var(--green-bg)]",
  hard_to_fill: "text-[var(--amber)] bg-[var(--amber-bg)]",
  portfolio: "text-[var(--text-secondary)] bg-[var(--surface-2)]",
  title: "text-[var(--blue)] bg-[var(--blue-bg)]",
};

function InsightIcon({ family }: { family: string }) {
  const color = FAMILY_COLOR[family] ?? "text-[var(--text-muted)] bg-[var(--surface-2)]";
  const icon = FAMILY_ICON[family] ?? "○";
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold flex-shrink-0 ${color}`}
    >
      {icon}
    </span>
  );
}

export function InsightCards({ insights, topPublishers }: InsightCardsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="flex gap-3 items-start">
            <InsightIcon family={insight.family} />
            <div className="min-w-0">
              <CardLabel>{insight.title}</CardLabel>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {insight.message}
              </p>
              {(insight.cpasImpactLow != null || insight.applyImpactLow != null) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {insight.cpasImpactLow != null && (
                    <span className="text-xs text-[var(--text-muted)]">
                      CPAS impact: {insight.cpasImpactLow}–{insight.cpasImpactHigh}%
                    </span>
                  )}
                  {insight.applyImpactLow != null && (
                    <span className="text-xs text-[var(--text-muted)]">
                      Apply impact: +{insight.applyImpactLow}–{insight.applyImpactHigh}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Top Publishers card — always shown if publishers exist */}
        {topPublishers.length > 0 && (
          <Card className="flex gap-3 items-start">
            <InsightIcon family="portfolio" />
            <div className="min-w-0">
              <CardLabel>Top Publishers</CardLabel>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-2">
                Recommended publisher channels for this portfolio mix:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topPublishers.map((pub) => (
                  <span
                    key={pub}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]"
                  >
                    {pub}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

import {
  findBudgetBand,
  getPlanningCurves,
  getTopPublishersForSpecialties,
} from "@/lib/db/media-plan.db";
import {
  getInsightRules,
  getLocationExpansionRules,
  getTitleRules,
  getPortfolioRules,
} from "@/lib/db/insight-engine.db";
import type {
  PlannerInputs,
  PlanResult,
  PlanSummary,
  MediaPlanGroup,
  MediaPlanRow,
  InsightCard,
  InsightFamily,
} from "@/lib/types";

// Family → human-readable section title
const FAMILY_TITLES: Record<string, string> = {
  cost_driver: "Cost Drivers",
  location: "Location Insights",
  location_expansion: "Expansion Opportunities",
  hard_to_fill: "Hard-to-Fill Roles",
  portfolio: "Portfolio Strategy",
  title: "Job Content Recommendations",
};

export function computePlan(inputs: PlannerInputs): PlanResult {
  const { jobFunctions, specialties, states, budget, durationDays, strategy } =
    inputs;

  // ── 1. Find budget band ────────────────────────────────────────────────────
  const band = findBudgetBand(budget);
  const budgetBandId = band?.budget_band_id ?? "B2"; // default to B2 if out of range

  // ── 2. Query planning curves ───────────────────────────────────────────────
  const curves = getPlanningCurves(
    jobFunctions,
    specialties,
    states,
    budgetBandId,
    durationDays
  );

  // ── 3. Allocate budget proportionally by absorption_capacity_factor ────────
  const totalWeight = curves.reduce(
    (sum, c) => sum + c.absorption_capacity_factor,
    0
  );

  const rows: MediaPlanRow[] = curves.map((c) => {
    const weight =
      totalWeight > 0 ? c.absorption_capacity_factor / totalWeight : 1 / curves.length;
    const spend = budget * weight;

    const cpas =
      strategy === "aggressive" ? c.aggressive_cpas_usd : c.balanced_cpas_usd;

    // Scale apply starts from midpoint proportionally to actual spend
    const midpointApplies =
      strategy === "aggressive"
        ? c.aggressive_apply_starts_at_budget_midpoint
        : c.balanced_apply_starts_at_budget_midpoint;

    const applyStarts =
      c.budget_midpoint_usd > 0
        ? Math.round((spend / c.budget_midpoint_usd) * midpointApplies)
        : Math.round(spend / cpas);

    return {
      specialty: c.specialty,
      state: c.state,
      stateName: c.state_name,
      spend,
      cpas,
      applyStarts,
      difficultyTier: difficultyLabel(c.specialty_difficulty_score),
      mediaCluster: c.media_planning_cluster,
      hotspotCluster: c.hotspot_cluster,
    };
  });

  // ── 4. Group by job function ───────────────────────────────────────────────
  const groupMap = new Map<string, MediaPlanRow[]>();
  for (const curve of curves) {
    if (!groupMap.has(curve.job_function)) {
      groupMap.set(curve.job_function, []);
    }
  }
  for (const row of rows) {
    const matchingCurve = curves.find(
      (c) => c.specialty === row.specialty && c.state === row.state
    );
    if (matchingCurve) {
      groupMap.get(matchingCurve.job_function)!.push(row);
    }
  }

  const groups: MediaPlanGroup[] = [];
  for (const [jf, jfRows] of groupMap.entries()) {
    if (jfRows.length === 0) continue;
    const totalSpend = jfRows.reduce((s, r) => s + r.spend, 0);
    const totalApplyStarts = jfRows.reduce((s, r) => s + r.applyStarts, 0);
    const avgCpas = totalApplyStarts > 0 ? totalSpend / totalApplyStarts : 0;
    groups.push({ jobFunction: jf, totalSpend, totalApplyStarts, avgCpas, rows: jfRows });
  }
  // Sort groups by totalSpend descending
  groups.sort((a, b) => b.totalSpend - a.totalSpend);

  // ── 5. Summary ─────────────────────────────────────────────────────────────
  const totalApplyStarts = rows.reduce((s, r) => s + r.applyStarts, 0);
  const avgCpas = totalApplyStarts > 0 ? budget / totalApplyStarts : 0;

  const topGroup = groups[0];
  const topOpportunity = topGroup
    ? `${topGroup.jobFunction} — highest volume opportunity with ${topGroup.totalApplyStarts.toLocaleString()} projected apply starts`
    : "No opportunity data available for the selected inputs.";

  // Risk flag: if avg CPAS > $3.60 or high-difficulty specialties dominate
  const highDiffCount = rows.filter((r) => r.difficultyTier === "High").length;
  const riskFlag =
    avgCpas > 3.6
      ? `Blended CPAS of $${avgCpas.toFixed(2)} is above benchmark. Consider adding volume roles to improve efficiency.`
      : highDiffCount > rows.length / 2
      ? "More than half of selected specialties are high-difficulty. Expect above-average CPAS."
      : null;

  const summary: PlanSummary = {
    totalBudget: budget,
    totalApplyStarts,
    avgCpas,
    strategy,
    durationDays,
    topOpportunity,
    riskFlag,
  };

  // ── 6. Insights ────────────────────────────────────────────────────────────
  const insightRules = getInsightRules(
    jobFunctions,
    states,
    budgetBandId,
    strategy
  );
  const expansionRules = getLocationExpansionRules(states, jobFunctions);
  const titleRules = getTitleRules(specialties);
  const portfolioRules = getPortfolioRules();

  const insights: InsightCard[] = [];
  const seenFamilies = new Set<string>();

  // Deduplicate: max 2 per family, cap total at 6 cards
  for (const rule of insightRules) {
    if (insights.length >= 6) break;
    const count = insights.filter((i) => i.family === rule.family).length;
    if (count >= 2) continue;

    insights.push({
      id: rule.rule_id,
      family: rule.family as InsightFamily,
      title: FAMILY_TITLES[rule.family] ?? rule.family,
      message: rule.message,
      cpasImpactLow: rule.cpas_impact_low_pct || undefined,
      cpasImpactHigh: rule.cpas_impact_high_pct || undefined,
      applyImpactLow: rule.apply_impact_low_pct || undefined,
      applyImpactHigh: rule.apply_impact_high_pct || undefined,
    });
    seenFamilies.add(rule.family);
  }

  // Add expansion insight if available
  if (expansionRules.length > 0 && !seenFamilies.has("location_expansion")) {
    const rule = expansionRules[0];
    insights.push({
      id: `expansion-${rule.state_code}-${rule.job_function}`,
      family: "location_expansion",
      title: "Expansion Opportunities",
      message: `${rule.rationale}. Expanding into ${rule.nearby_states} could lift apply volume by ${rule.estimated_apply_lift_low_pct}–${rule.estimated_apply_lift_high_pct}%.`,
      applyImpactLow: rule.estimated_apply_lift_low_pct,
      applyImpactHigh: rule.estimated_apply_lift_high_pct,
      cpasImpactLow: rule.estimated_cpas_reduction_low_pct,
      cpasImpactHigh: rule.estimated_cpas_reduction_high_pct,
    });
  }

  // Add title insight if available
  if (titleRules.length > 0 && !seenFamilies.has("title")) {
    const rule = titleRules[0];
    insights.push({
      id: `title-${rule.pattern}`,
      family: "title",
      title: "Job Content Recommendations",
      message: `${rule.reason}. Recommended format: "${rule.recommended_title}".`,
    });
  }

  // Add portfolio insight if few rules matched
  if (insights.length < 3 && portfolioRules.length > 0) {
    const rule = portfolioRules[0];
    insights.push({
      id: rule.portfolio_rule_id,
      family: "portfolio",
      title: "Portfolio Strategy",
      message: rule.message,
    });
  }

  // ── 7. Top publishers ──────────────────────────────────────────────────────
  const topPublishers = getTopPublishersForSpecialties(specialties);

  return { summary, groups, insights, topPublishers };
}

function difficultyLabel(score: number): string {
  if (score <= 4) return "Low";
  if (score <= 6) return "Medium";
  if (score <= 8) return "High";
  return "Very High";
}

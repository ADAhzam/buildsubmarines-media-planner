// ─── DB Row Types (media_plan_v2.db) ────────────────────────────────────────

export interface DbJobFunction {
  job_function: string;
  front_end_group: string;
  display_order: number;
}

export interface DbSpecialtyDefinition {
  specialty: string;
  job_function: string;
  build_sub_taxonomy: string;
  media_planning_cluster: string;
  difficulty: number;
  difficulty_tier: string;
  base_cpas_30d: number;
  monthly_capacity: number;
}

export interface DbStateFactor {
  state: string;
  state_name: string;
  hotspot_cluster: string;
  geo_cpas_multiplier: number;
  absorption_capacity_factor: number;
  observed_hotspot_flag: string;
}

export interface DbBudgetBand {
  budget_band_id: string;
  min_budget_usd: number;
  max_budget_usd: number;
  midpoint_budget_usd: number;
  band_label: string;
  low_side_pressure: number;
  saturation_pressure: number;
  aggressive_base_uplift_pct: number;
}

export interface DbPlanningCurve {
  job_function: string;
  specialty: string;
  state: string;
  state_name: string;
  hotspot_cluster: string;
  budget_band_id: string;
  budget_band_label: string;
  budget_midpoint_usd: number;
  duration_days: number;
  balanced_cpas_usd: number;
  aggressive_cpas_usd: number;
  balanced_apply_starts_at_budget_midpoint: number;
  aggressive_apply_starts_at_budget_midpoint: number;
  geo_cpas_multiplier: number;
  absorption_capacity_factor: number;
  specialty_difficulty_score: number;
  build_sub_taxonomy: string;
  media_planning_cluster: string;
}

// ─── DB Row Types (insight_engine_v2.db) ────────────────────────────────────

export interface DbInsightRule {
  rule_id: string;
  family: string;
  scope: string;
  job_function: string | null;
  specialty: string | null;
  state_code: string | null;
  budget_band: string | null;
  mode: string | null;
  message: string;
  cpas_impact_low_pct: number;
  cpas_impact_high_pct: number;
  apply_impact_low_pct: number;
  apply_impact_high_pct: number;
  priority: number;
}

export interface DbPublisherMix {
  job_function: string;
  specialty: string;
  publisher: string;
  publisher_type: string;
  balanced_weight: number;
  aggressive_weight: number;
}

export interface DbLocationExpansionRule {
  state_code: string;
  job_function: string;
  nearby_states: string;
  rationale: string;
  estimated_apply_lift_low_pct: number;
  estimated_apply_lift_high_pct: number;
  estimated_cpas_reduction_low_pct: number;
  estimated_cpas_reduction_high_pct: number;
}

export interface DbTitleRule {
  pattern: string;
  recommended_title: string;
  reason: string;
}

export interface DbPortfolioRule {
  portfolio_rule_id: string;
  selection_scope: string;
  message: string;
  priority: number;
}

export interface DbInsightState {
  state_code: string;
  state_name: string;
  hotspot_cluster: string;
  hotspot_rank: number;
}

// ─── Application Input/Output Types ─────────────────────────────────────────

export type Strategy = "balanced" | "aggressive";
export type DurationDays = 15 | 30 | 60 | 90;
export type BudgetMode = "user" | "recommended";

export interface PlannerInputs {
  jobFunctions: string[];
  specialties: string[];
  states: string[];
  budget: number;
  budgetMode: BudgetMode;
  durationDays: DurationDays;
  strategy: Strategy;
}

// ─── Reference Data (for dropdowns) ─────────────────────────────────────────

export interface JobFunctionOption {
  value: string;
  label: string;
  displayOrder: number;
}

export interface SpecialtyOption {
  value: string;
  label: string;
  jobFunction: string;
  difficultyTier: string;
}

export interface StateOption {
  value: string;
  label: string;
  hotspotCluster: string;
  hotspotRank: number;
}

export interface ReferenceData {
  jobFunctions: JobFunctionOption[];
  specialties: SpecialtyOption[];
  states: StateOption[];
}

// ─── Plan Output Types ───────────────────────────────────────────────────────

export interface MediaPlanRow {
  specialty: string;
  state: string;
  stateName: string;
  spend: number;
  cpas: number;
  applyStarts: number;
  difficultyTier: string;
  mediaCluster: string;
  hotspotCluster: string;
}

export interface MediaPlanGroup {
  jobFunction: string;
  totalSpend: number;
  totalApplyStarts: number;
  avgCpas: number;
  rows: MediaPlanRow[];
}

export interface PlanSummary {
  totalBudget: number;
  totalApplyStarts: number;
  avgCpas: number;
  strategy: Strategy;
  durationDays: DurationDays;
  topOpportunity: string;
  riskFlag: string | null;
}

export type InsightFamily =
  | "cost_driver"
  | "location"
  | "location_expansion"
  | "hard_to_fill"
  | "portfolio"
  | "title";

export interface InsightCard {
  id: string;
  family: InsightFamily;
  title: string;
  message: string;
  cpasImpactLow?: number;
  cpasImpactHigh?: number;
  applyImpactLow?: number;
  applyImpactHigh?: number;
}

export interface PlanResult {
  summary: PlanSummary;
  groups: MediaPlanGroup[];
  insights: InsightCard[];
  topPublishers: string[];
}

// ─── Preset Scenario ─────────────────────────────────────────────────────────

export interface PresetScenario {
  id: string;
  label: string;
  description: string;
  inputs: PlannerInputs;
}

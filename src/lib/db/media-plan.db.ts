import Database from "better-sqlite3";
import path from "path";
import type {
  DbJobFunction,
  DbSpecialtyDefinition,
  DbStateFactor,
  DbBudgetBand,
  DbPlanningCurve,
} from "@/lib/types";

// Singleton — one connection per process
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(process.cwd(), "data", "media_plan_v2.db");
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

export function getJobFunctions(): DbJobFunction[] {
  return getDb()
    .prepare(
      "SELECT job_function, front_end_group, display_order FROM job_functions ORDER BY display_order"
    )
    .all() as DbJobFunction[];
}

export function getSpecialties(
  jobFunctions?: string[]
): DbSpecialtyDefinition[] {
  if (!jobFunctions || jobFunctions.length === 0) {
    return getDb()
      .prepare(
        "SELECT specialty, job_function, build_sub_taxonomy, media_planning_cluster, difficulty, difficulty_tier, base_cpas_30d, monthly_capacity FROM specialty_definitions ORDER BY job_function, specialty"
      )
      .all() as DbSpecialtyDefinition[];
  }
  const placeholders = jobFunctions.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT specialty, job_function, build_sub_taxonomy, media_planning_cluster, difficulty, difficulty_tier, base_cpas_30d, monthly_capacity FROM specialty_definitions WHERE job_function IN (${placeholders}) ORDER BY job_function, specialty`
    )
    .all(...jobFunctions) as DbSpecialtyDefinition[];
}

export function getStateFactor(state: string): DbStateFactor | undefined {
  return getDb()
    .prepare(
      "SELECT state, state_name, hotspot_cluster, geo_cpas_multiplier, absorption_capacity_factor, observed_hotspot_flag FROM state_factors WHERE state = ?"
    )
    .get(state) as DbStateFactor | undefined;
}

export function getAllStateFactors(): DbStateFactor[] {
  return getDb()
    .prepare(
      "SELECT state, state_name, hotspot_cluster, geo_cpas_multiplier, absorption_capacity_factor, observed_hotspot_flag FROM state_factors ORDER BY state_name"
    )
    .all() as DbStateFactor[];
}

export function getBudgetBands(): DbBudgetBand[] {
  return getDb()
    .prepare("SELECT * FROM budget_bands ORDER BY min_budget_usd")
    .all() as DbBudgetBand[];
}

export function findBudgetBand(budget: number): DbBudgetBand | undefined {
  return getDb()
    .prepare(
      "SELECT * FROM budget_bands WHERE ? >= min_budget_usd AND ? <= max_budget_usd LIMIT 1"
    )
    .get(budget, budget) as DbBudgetBand | undefined;
}

export function getPlanningCurves(
  jobFunctions: string[],
  specialties: string[],
  states: string[],
  budgetBandId: string,
  durationDays: number
): DbPlanningCurve[] {
  if (jobFunctions.length === 0 || specialties.length === 0 || states.length === 0) return [];

  const jfPlaceholders = jobFunctions.map(() => "?").join(",");
  const specPlaceholders = specialties.map(() => "?").join(",");
  const statePlaceholders = states.map(() => "?").join(",");

  return getDb()
    .prepare(
      `SELECT * FROM planning_curves
       WHERE job_function IN (${jfPlaceholders})
         AND specialty IN (${specPlaceholders})
         AND state IN (${statePlaceholders})
         AND budget_band_id = ?
         AND duration_days = ?`
    )
    .all(
      ...jobFunctions,
      ...specialties,
      ...states,
      budgetBandId,
      durationDays
    ) as DbPlanningCurve[];
}

// Returns every specialty → state pair that exists in planning_curves.
// Used client-side to drive cascading state auto-selection.
export function getSpecialtyStateMapping(): Record<string, string[]> {
  const rows = getDb()
    .prepare(
      "SELECT DISTINCT specialty, state FROM planning_curves ORDER BY specialty, state"
    )
    .all() as { specialty: string; state: string }[];

  const mapping: Record<string, string[]> = {};
  for (const row of rows) {
    if (!mapping[row.specialty]) mapping[row.specialty] = [];
    mapping[row.specialty].push(row.state);
  }
  return mapping;
}

export function getTopPublishersForSpecialties(
  specialties: string[]
): string[] {
  if (specialties.length === 0) return [];
  const placeholders = specialties.map(() => "?").join(",");
  // GROUP BY publisher so each publisher appears once, ordered by its best
  // (lowest) rank across all selected specialties. This ensures niche publishers
  // that are rank 2–3 for their specific specialty surface correctly instead of
  // being buried behind rank-1 entries from unrelated specialties.
  const rows = getDb()
    .prepare(
      `SELECT publisher, MIN(rank) AS best_rank
       FROM specialty_publishers
       WHERE specialty IN (${placeholders})
       GROUP BY publisher
       ORDER BY best_rank`
    )
    .all(...specialties) as { publisher: string; best_rank: number }[];
  // Scale the cap with portfolio breadth so broader selections surface more variety
  const cap = specialties.length <= 2 ? 6 : specialties.length <= 6 ? 8 : 12;
  return rows.slice(0, cap).map((r) => r.publisher);
}

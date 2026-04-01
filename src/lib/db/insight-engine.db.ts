import Database from "better-sqlite3";
import path from "path";
import type {
  DbInsightRule,
  DbPublisherMix,
  DbLocationExpansionRule,
  DbTitleRule,
  DbPortfolioRule,
  DbInsightState,
} from "@/lib/types";

// Singleton — one connection per process
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dbPath = path.join(
      process.cwd(),
      "data",
      "insight_engine_v2.db"
    );
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

export function getAllInsightStates(): DbInsightState[] {
  return getDb()
    .prepare(
      "SELECT state_code, state_name, hotspot_cluster, hotspot_rank FROM states ORDER BY hotspot_rank"
    )
    .all() as DbInsightState[];
}

export function getInsightRules(
  jobFunctions: string[],
  states: string[],
  budgetBand: string,
  strategy: string
): DbInsightRule[] {
  const jfPlaceholders = jobFunctions.map(() => "?").join(",");
  const stPlaceholders = states.map(() => "?").join(",");

  // Match: global rules, job-function-scoped rules, state-scoped rules
  // mode matching: null means applies to all modes
  const rows = getDb()
    .prepare(
      `SELECT * FROM insight_rules
       WHERE (
         scope = 'global'
         OR (scope = 'job_function' AND (job_function IS NULL OR job_function IN (${jfPlaceholders})))
         OR (scope = 'state' AND state_code IN (${stPlaceholders}))
         OR scope = 'portfolio'
       )
       AND (mode IS NULL OR mode = ?)
       ORDER BY priority ASC`
    )
    .all(
      ...jobFunctions,
      ...states,
      strategy
    ) as DbInsightRule[];

  return rows;
}

export function getLocationExpansionRules(
  states: string[],
  jobFunctions: string[]
): DbLocationExpansionRule[] {
  if (states.length === 0 || jobFunctions.length === 0) return [];
  const stPlaceholders = states.map(() => "?").join(",");
  const jfPlaceholders = jobFunctions.map(() => "?").join(",");

  return getDb()
    .prepare(
      `SELECT * FROM location_expansion_rules
       WHERE state_code IN (${stPlaceholders})
         AND job_function IN (${jfPlaceholders})
       LIMIT 3`
    )
    .all(...states, ...jobFunctions) as DbLocationExpansionRule[];
}

export function getTitleRules(specialties: string[]): DbTitleRule[] {
  // Title rules match on pattern (substring of specialty name)
  // Fetch all and filter in JS since patterns are substrings
  const all = getDb()
    .prepare("SELECT pattern, recommended_title, reason FROM title_rules")
    .all() as DbTitleRule[];

  const lower = specialties.map((s) => s.toLowerCase());
  return all.filter((rule) =>
    lower.some((s) => s.includes(rule.pattern.toLowerCase()))
  );
}

export function getPortfolioRules(): DbPortfolioRule[] {
  return getDb()
    .prepare("SELECT * FROM portfolio_rules ORDER BY priority")
    .all() as DbPortfolioRule[];
}

export function getPublisherMix(
  specialties: string[],
  strategy: string
): DbPublisherMix[] {
  if (specialties.length === 0) return [];
  const placeholders = specialties.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT job_function, specialty, publisher, publisher_type, balanced_weight, aggressive_weight
       FROM publisher_mix
       WHERE specialty IN (${placeholders})
       ORDER BY ${strategy === "aggressive" ? "aggressive_weight" : "balanced_weight"} DESC`
    )
    .all(...specialties) as DbPublisherMix[];
}

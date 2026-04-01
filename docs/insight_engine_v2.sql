
CREATE TABLE schema_tables (table_name TEXT, grain TEXT, purpose TEXT);
CREATE TABLE observed_jobs (job_title TEXT, observed_category TEXT, normalized_function TEXT, specialty TEXT, company TEXT, state TEXT, salary_min REAL, salary_max REAL, salary_period TEXT, remote INTEGER);
CREATE TABLE job_functions (job_function TEXT, observed_job_count INTEGER, observed_share REAL);
CREATE TABLE specialties (job_function TEXT, specialty TEXT, difficulty_tier TEXT, difficulty_score INTEGER, base_cpas_balanced_30d_sweetspot REAL, min_modeled_cpas REAL, max_modeled_cpas REAL, recommended_budget_min INTEGER, recommended_budget_max INTEGER, balanced_publisher_factor REAL, aggressive_publisher_factor REAL, observed_job_count INTEGER, observed_share REAL, observed_states TEXT, median_salary_proxy_annualized REAL, title_optimization_note TEXT);
CREATE TABLE states (state_code TEXT, state_name TEXT, hotspot_cluster TEXT, hotspot_rank INTEGER, cost_multiplier REAL, supply_score INTEGER, competition_score INTEGER, candidate_density_score INTEGER, defense_presence_score INTEGER, nearby_states TEXT);
CREATE TABLE budget_bands (budget_band TEXT, min_budget INTEGER, max_budget INTEGER, curve_factor REAL, efficiency_phase TEXT, notes TEXT);
CREATE TABLE duration_factors (duration_days INTEGER, duration_factor REAL, notes TEXT);
CREATE TABLE mode_uplifts (mode TEXT, difficulty_tier TEXT, budget_band TEXT, uplift_pct REAL, notes TEXT);
CREATE TABLE publisher_catalog (publisher TEXT, publisher_type TEXT, role TEXT, base_factor REAL, notes TEXT, source_url TEXT);
CREATE TABLE publisher_mix (job_function TEXT, specialty TEXT, publisher TEXT, publisher_type TEXT, publisher_role TEXT, balanced_weight REAL, aggressive_weight REAL, rationale TEXT);
CREATE TABLE insight_rules (rule_id TEXT, family TEXT, scope TEXT, job_function TEXT, specialty TEXT, state_code TEXT, budget_band TEXT, mode TEXT, trigger_logic TEXT, message TEXT, cpas_impact_low_pct INTEGER, cpas_impact_high_pct INTEGER, apply_impact_low_pct INTEGER, apply_impact_high_pct INTEGER, priority INTEGER);
CREATE TABLE title_rules (pattern TEXT, recommended_title TEXT, reason TEXT, ctr_apply_uplift_low_pct INTEGER, ctr_apply_uplift_high_pct INTEGER, cpas_reduction_low_pct INTEGER, cpas_reduction_high_pct INTEGER);
CREATE TABLE location_expansion_rules (state_code TEXT, job_function TEXT, nearby_states TEXT, rationale TEXT, estimated_apply_lift_low_pct INTEGER, estimated_apply_lift_high_pct INTEGER, estimated_cpas_reduction_low_pct INTEGER, estimated_cpas_reduction_high_pct INTEGER);
CREATE TABLE portfolio_rules (portfolio_rule_id TEXT, selection_scope TEXT, message TEXT, priority INTEGER);
CREATE TABLE planning_curves (job_function TEXT, specialty TEXT, state_code TEXT, hotspot_cluster TEXT, budget_band TEXT, duration_days INTEGER, balanced_cpas REAL, aggressive_cpas REAL, balanced_apply_starts_per_10k REAL, aggressive_apply_starts_per_10k REAL, budget_curve_factor REAL, duration_factor REAL, state_cost_multiplier REAL, publisher_factor_balanced REAL, publisher_factor_aggressive REAL);
CREATE TABLE sources (source_type TEXT, source_name TEXT, url_or_reference TEXT, notes TEXT, citation TEXT);

-- Updated against jobs_latest.json + fast_jobs.json. Blended balanced CPAS recalibrated closer to ~$3.

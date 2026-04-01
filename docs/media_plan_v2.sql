PRAGMA foreign_keys = OFF;

CREATE TABLE sources (
  source_id TEXT PRIMARY KEY,
  source_type TEXT,
  title TEXT,
  reference TEXT,
  notes TEXT
);

CREATE TABLE raw_jobs (
  title TEXT,
  company TEXT,
  category_raw TEXT,
  specialty_norm TEXT,
  state_raw TEXT,
  state_inferred TEXT,
  state_name TEXT,
  location TEXT,
  remote BOOLEAN,
  salary_raw TEXT,
  salary_min REAL,
  salary_max REAL,
  date_posted TEXT,
  job_url TEXT
);

CREATE TABLE job_functions (
  job_function TEXT PRIMARY KEY,
  front_end_group TEXT,
  display_order INTEGER
);

CREATE TABLE specialty_definitions (
  specialty TEXT PRIMARY KEY,
  job_function TEXT,
  build_sub_taxonomy TEXT,
  media_planning_cluster TEXT,
  difficulty INTEGER,
  difficulty_tier TEXT,
  volume_tier TEXT,
  base_cpas_30d REAL,
  low_budget_sens REAL,
  high_budget_sens REAL,
  duration_sens REAL,
  aggressive_sens REAL,
  monthly_capacity INTEGER,
  title_family TEXT,
  observed_job_count_in_scrape INTEGER,
  observed_median_salary REAL,
  modeling_note TEXT
);

CREATE TABLE state_factors (
  state TEXT PRIMARY KEY,
  state_name TEXT,
  hotspot_cluster TEXT,
  geo_cpas_multiplier REAL,
  absorption_capacity_factor REAL,
  observed_job_count_in_scrape INTEGER,
  observed_hotspot_flag TEXT
);

CREATE TABLE hotspot_clusters (
  hotspot_cluster TEXT,
  states TEXT,
  summary TEXT
);

CREATE TABLE observed_hotspots (
  state TEXT,
  state_name TEXT,
  hotspot_cluster TEXT,
  geo_cpas_multiplier REAL,
  absorption_capacity_factor REAL,
  observed_job_count_in_scrape INTEGER,
  observed_hotspot_flag TEXT,
  observed_hotspot_rank INTEGER
);

CREATE TABLE budget_bands (
  budget_band_id TEXT PRIMARY KEY,
  min_budget_usd INTEGER,
  max_budget_usd INTEGER,
  midpoint_budget_usd INTEGER,
  band_label TEXT,
  low_side_pressure REAL,
  saturation_pressure REAL,
  aggressive_base_uplift_pct REAL
);

CREATE TABLE duration_factors (
  duration_days INTEGER PRIMARY KEY,
  duration_multiplier_balanced REAL,
  aggressive_duration_factor REAL
);

CREATE TABLE publisher_catalog (
  publisher TEXT PRIMARY KEY,
  publisher_type TEXT,
  primary_strength TEXT,
  best_for TEXT,
  source TEXT
);

CREATE TABLE specialty_publishers (
  specialty TEXT,
  publisher TEXT,
  rank INTEGER
);

CREATE TABLE recommended_budget_anchors (
  specialty TEXT,
  job_function TEXT,
  state TEXT,
  state_name TEXT,
  hotspot_cluster TEXT,
  efficient_balanced_cpas_30d REAL,
  efficient_monthly_apply_capacity INTEGER,
  recommended_budget_floor_usd INTEGER,
  recommended_budget_efficient_usd INTEGER,
  recommended_budget_ceiling_usd INTEGER,
  media_planning_cluster TEXT
);

CREATE TABLE planning_curves (
  job_function TEXT,
  specialty TEXT,
  state TEXT,
  state_name TEXT,
  hotspot_cluster TEXT,
  budget_band_id TEXT,
  budget_band_label TEXT,
  budget_midpoint_usd INTEGER,
  duration_days INTEGER,
  balanced_cpas_usd REAL,
  aggressive_cpas_usd REAL,
  balanced_apply_starts_at_budget_midpoint INTEGER,
  aggressive_apply_starts_at_budget_midpoint INTEGER,
  geo_cpas_multiplier REAL,
  absorption_capacity_factor REAL,
  specialty_difficulty_score INTEGER,
  build_sub_taxonomy TEXT,
  media_planning_cluster TEXT
);
-- Updated against jobs_latest.json + fast_jobs.json. Balanced blended CPAS recalibrated closer to ~$3.

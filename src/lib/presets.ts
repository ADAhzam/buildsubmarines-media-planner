import type { PresetScenario } from "@/lib/types";

// All specialty + state combos are verified against planning_curves in media_plan_v2.db
export const PRESETS: PresetScenario[] = [
  {
    id: "atlantic-engineering",
    label: "Atlantic Naval — Engineering",
    description: "Engineering + QA roles across VA, CT, MD.",
    inputs: {
      jobFunctions: ["Engineering", "Quality & Inspection"],
      specialties: ["Electrical Engineer", "Mechanical Engineer", "Quality Inspector", "Calibration Technician"],
      states: ["VA", "CT", "MD"],
      budget: 120000,
      budgetMode: "user",
      durationDays: 30,
      strategy: "balanced",
    },
  },
  {
    id: "southern-manufacturing",
    label: "Southern Belt — Manufacturing Scale",
    description: "High-volume roles across VA, NC, TX, FL.",
    inputs: {
      jobFunctions: ["Manufacturing & Production"],
      specialties: ["Assembler", "CNC Machinist", "Welder"],
      states: ["VA", "NC", "TX", "FL"],
      budget: 200000,
      budgetMode: "user",
      durationDays: 30,
      strategy: "balanced",
    },
  },
  {
    id: "midwest-broad",
    label: "Midwest — Broad Portfolio",
    description: "Multi-function portfolio across OH, PA, TX.",
    inputs: {
      jobFunctions: ["Manufacturing & Production", "Engineering", "Supply Chain & Planning"],
      specialties: ["Assembler", "Welder", "Mechanical Engineer", "Supply Chain Planner"],
      states: ["OH", "PA", "TX"],
      budget: 350000,
      budgetMode: "user",
      durationDays: 60,
      strategy: "balanced",
    },
  },
  {
    id: "fast-spend",
    label: "Aggressive Fast Spend",
    description: "Front-load applies on key manufacturing roles.",
    inputs: {
      jobFunctions: ["Manufacturing & Production"],
      specialties: ["Assembler", "CNC Machinist"],
      states: ["VA", "CT", "FL"],
      budget: 80000,
      budgetMode: "user",
      durationDays: 15,
      strategy: "aggressive",
    },
  },
];

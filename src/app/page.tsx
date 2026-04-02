import { PlannerShell } from "@/components/planner/PlannerShell";
import { PRESETS } from "@/lib/presets";
import { getJobFunctions, getSpecialties, getSpecialtyStateMapping } from "@/lib/db/media-plan.db";
import { getAllInsightStates } from "@/lib/db/insight-engine.db";
import type {
  ReferenceData,
  JobFunctionOption,
  SpecialtyOption,
  StateOption,
} from "@/lib/types";

function getReferenceData(): ReferenceData {
  const jobFunctions: JobFunctionOption[] = getJobFunctions().map((r) => ({
    value: r.job_function,
    label: r.front_end_group,
    displayOrder: r.display_order,
  }));

  const specialties: SpecialtyOption[] = getSpecialties().map((r) => ({
    value: r.specialty,
    label: r.specialty,
    jobFunction: r.job_function,
    difficultyTier: r.difficulty_tier,
  }));

  const states: StateOption[] = getAllInsightStates().map((r) => ({
    value: r.state_code,
    label: r.state_name,
    hotspotCluster: r.hotspot_cluster,
    hotspotRank: r.hotspot_rank,
  }));

  const specialtyStates = getSpecialtyStateMapping();

  return { jobFunctions, specialties, states, specialtyStates };
}

export default function PlannerPage() {
  const reference = getReferenceData();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg)]">
      <PlannerShell reference={reference} presets={PRESETS} />
    </div>
  );
}

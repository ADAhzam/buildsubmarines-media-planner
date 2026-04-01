import { NextRequest } from "next/server";
import { getJobFunctions, getSpecialties } from "@/lib/db/media-plan.db";
import { getAllInsightStates } from "@/lib/db/insight-engine.db";
import type {
  JobFunctionOption,
  SpecialtyOption,
  StateOption,
  ReferenceData,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest): Promise<Response> {
  const jobFunctionRows = getJobFunctions();
  const specialtyRows = getSpecialties();
  const stateRows = getAllInsightStates();

  const jobFunctions: JobFunctionOption[] = jobFunctionRows.map((r) => ({
    value: r.job_function,
    label: r.front_end_group,
    displayOrder: r.display_order,
  }));

  const specialties: SpecialtyOption[] = specialtyRows.map((r) => ({
    value: r.specialty,
    label: r.specialty,
    jobFunction: r.job_function,
    difficultyTier: r.difficulty_tier,
  }));

  const states: StateOption[] = stateRows.map((r) => ({
    value: r.state_code,
    label: r.state_name,
    hotspotCluster: r.hotspot_cluster,
    hotspotRank: r.hotspot_rank,
  }));

  const data: ReferenceData = { jobFunctions, specialties, states };
  return Response.json(data);
}

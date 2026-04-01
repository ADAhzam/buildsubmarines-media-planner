import { NextRequest } from "next/server";
import { computePlan } from "@/lib/compute/planner";
import type { PlannerInputs } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const inputs = body as PlannerInputs;

  if (
    !Array.isArray(inputs.jobFunctions) ||
    !Array.isArray(inputs.specialties) ||
    !Array.isArray(inputs.states) ||
    typeof inputs.budget !== "number" ||
    typeof inputs.durationDays !== "number" ||
    !inputs.strategy
  ) {
    return Response.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  if (inputs.specialties.length === 0 || inputs.states.length === 0) {
    return Response.json(
      { error: "Select at least one specialty and one state." },
      { status: 400 }
    );
  }

  if (inputs.budget < 10000 || inputs.budget > 1000000) {
    return Response.json(
      { error: "Budget must be between $10,000 and $1,000,000." },
      { status: 400 }
    );
  }

  const result = computePlan(inputs);
  return Response.json(result);
}

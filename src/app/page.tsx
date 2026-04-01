import { PlannerShell } from "@/components/planner/PlannerShell";
import { PRESETS } from "@/lib/presets";
import type { ReferenceData } from "@/lib/types";

async function getReferenceData(): Promise<ReferenceData> {
  // In development, fetch from localhost; on Vercel, use the internal URL.
  // Using absolute URL is required when calling own route handlers from a Server Component.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const res = await fetch(`${base}/api/reference`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load reference data");
  return res.json() as Promise<ReferenceData>;
}

export default async function PlannerPage() {
  const reference = await getReferenceData();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg)]">
      <PlannerShell reference={reference} presets={PRESETS} />
    </div>
  );
}

import { NextResponse } from "next/server";
import { approveRequest } from "@/lib/onboarding-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const onboardingRequest = approveRequest(id);
  if (!onboardingRequest) {
    return NextResponse.json({ error: "Onboarding request not found." }, { status: 404 });
  }

  return NextResponse.json(onboardingRequest);
}
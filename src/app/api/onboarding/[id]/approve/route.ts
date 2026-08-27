import { NextResponse } from "next/server";
import { approveRequest } from "@/lib/onboarding-store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const onboardingRequest = await approveRequest(id);
  if (!onboardingRequest) {
    return NextResponse.json({ error: "Onboarding request not found." }, { status: 404 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (webhookUrl && onboardingRequest.status === "Approved") {
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingRequest),
      });

      if (!webhookResponse.ok) {
        console.error(`N8N webhook returned ${webhookResponse.status}.`);
      }
    } catch (error) {
      console.error("Unable to send onboarding approval webhook.", error);
    }
  }

  return NextResponse.json(onboardingRequest);
}
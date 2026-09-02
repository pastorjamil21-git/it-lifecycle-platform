import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const onboardingRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.onboardingRequest.update({
        where: { id },
        data: { status: "Approved" },
      });

      await tx.auditLog.create({
        data: {
          action: "APPROVED",
          entity: "OnboardingRequest",
          entityId: id,
          details: `Onboarding request approved for ${updated.name}`,
        },
      });

      return updated;
    });

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(onboardingRequest),
        });

        if (!webhookResponse.ok) {
          console.error(`N8N webhook returned ${webhookResponse.status}`);
        }
      } catch (error) {
        console.error("Unable to send onboarding approval webhook:", error);
      }
    }

    return NextResponse.json(onboardingRequest);
  } catch (error) {
    console.error("Failed to approve request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
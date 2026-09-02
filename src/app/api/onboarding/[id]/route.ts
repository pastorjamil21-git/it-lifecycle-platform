import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const { id } = await params;

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.onboardingRequest.update({
        where: { id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          action: status,
          entity: "OnboardingRequest",
          entityId: id,
          details: `Onboarding request ${status.toLowerCase()} for ${updated.name}`,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
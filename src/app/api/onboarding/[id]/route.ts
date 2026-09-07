import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

const ALLOWED_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER"];
const ALLOWED_STATUSES = ["Approved", "Rejected", "Provisioning", "Completed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { status } = await request.json();
    const { id } = await params;
    if (!ALLOWED_STATUSES.includes(status)) {
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
          action: status.toUpperCase(),
          entity: "OnboardingRequest",
          entityId: id,
          details: `Onboarding request moved to ${status} for ${updated.name} by ${session.user?.email}`,
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
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";

const ALLOWED_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER"];

export async function POST(
  _request: Request,
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
    const { id } = await params;
    const offboardingRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.offboardingRequest.update({
        where: { id },
        data: { status: "Approved" },
      });
      await tx.auditLog.create({
        data: {
          action: "APPROVED",
          entity: "OffboardingRequest",
          entityId: id,
          details: `Offboarding request approved for ${updated.name} by ${session.user?.email}`,
        },
      });
      return updated;
    });
    return NextResponse.json(offboardingRequest);
  } catch (error) {
    console.error("Failed to approve offboarding request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
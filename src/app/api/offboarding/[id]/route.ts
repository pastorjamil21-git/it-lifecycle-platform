import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

const ALLOWED_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER"];
const ALLOWED_STATUSES = ["Approved", "Rejected", "Revoking", "Completed"];

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
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const existing = await tx.offboardingRequest.findUnique({ where: { id } });
      if (!existing) throw new Error("Offboarding request not found.");

      let revokedCount = 0;

      if (status === "Revoking" && existing.userId) {
        const assignments = await tx.licenseAssignment.findMany({
          where: { userId: existing.userId },
          include: { license: true, hardwareAsset: true },
        });

        for (const assignment of assignments) {
          await tx.license.update({
            where: { id: assignment.licenseId },
            data: { availableSeats: { increment: 1 } },
          });
          if (assignment.hardwareAssetId) {
            await tx.hardwareAsset.update({
              where: { id: assignment.hardwareAssetId },
              data: { status: "AVAILABLE" },
            });
          }
          await tx.licenseAssignment.delete({ where: { id: assignment.id } });
          revokedCount++;
        }

        await tx.user.update({
          where: { id: existing.userId },
          data: { isActive: false },
        });
      }

      const updated = await tx.offboardingRequest.update({
        where: { id },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          action: status.toUpperCase(),
          entity: "OffboardingRequest",
          entityId: id,
          details:
            status === "Revoking"
              ? `Access revoked for ${updated.name}: ${revokedCount} assignment(s) reclaimed, account deactivated, by ${session.user?.email}`
              : `Offboarding request moved to ${status} for ${updated.name} by ${session.user?.email}`,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Failed to update status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
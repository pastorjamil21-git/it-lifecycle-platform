import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!["ADMIN", "IT_TECH"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, licenseId, hardwareAssetId } = body;

  if (!userId || !licenseId) {
    return NextResponse.json(
      { error: "userId and licenseId are required." },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const license = await tx.license.findUnique({ where: { id: licenseId } });
      if (!license) throw new Error("License not found.");
      if (license.availableSeats <= 0) throw new Error("No available seats for this license.");

      if (hardwareAssetId) {
        const hardware = await tx.hardwareAsset.findUnique({ where: { id: hardwareAssetId } });
        if (!hardware) throw new Error("Hardware asset not found.");
        if (hardware.status !== "AVAILABLE") throw new Error("Hardware asset is not available.");
      }

      const assignment = await tx.licenseAssignment.create({
        data: {
          userId,
          licenseId,
          hardwareAssetId: hardwareAssetId || null,
        },
      });

      await tx.license.update({
        where: { id: licenseId },
        data: { availableSeats: { decrement: 1 } },
      });

      if (hardwareAssetId) {
        await tx.hardwareAsset.update({
          where: { id: hardwareAssetId },
          data: { status: "ASSIGNED" },
        });
      }

      const user = await tx.user.findUnique({ where: { id: userId } });

      await tx.auditLog.create({
        data: {
          action: "ASSIGNED",
          entity: "LicenseAssignment",
          entityId: assignment.id,
          details: `${license.softwareName}${hardwareAssetId ? " + hardware" : ""} assigned to ${user?.name || userId} by ${session.user?.email}`,
        },
      });

      return assignment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to assign:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
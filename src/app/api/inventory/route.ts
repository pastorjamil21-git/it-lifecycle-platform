import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (!["ADMIN", "IT_TECH"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [hardware, licenses, users, assignments] = await Promise.all([
    prisma.hardwareAsset.findMany({ orderBy: { modelName: "asc" } }),
    prisma.license.findMany({ orderBy: { softwareName: "asc" } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    }),
    prisma.licenseAssignment.findMany({
      include: { license: true, user: true, hardwareAsset: true },
      orderBy: { assignedAt: "desc" },
    }),
  ]);

  return NextResponse.json({ hardware, licenses, users, assignments });
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.offboardingRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, title, department, lastWorkingDay, manager } = body;
  if (
    ![name, title, department, lastWorkingDay, manager].every(
      (value) => typeof value === "string" && value.trim()
    )
  ) {
    return NextResponse.json(
      { error: "All offboarding fields are required." },
      { status: 400 }
    );
  }
  const parsedLastDay = new Date(lastWorkingDay);
  if (Number.isNaN(parsedLastDay.getTime())) {
    return NextResponse.json({ error: "Last working day is invalid." }, { status: 400 });
  }

  const offboardingRequest = await prisma.$transaction(async (tx) => {
    const created = await tx.offboardingRequest.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        department: department.trim(),
        lastWorkingDay: parsedLastDay.toISOString(),
        manager: manager.trim(),
        status: "Pending",
      },
    });
    await tx.auditLog.create({
      data: {
        action: "CREATED",
        entity: "OffboardingRequest",
        entityId: created.id,
        details: `Offboarding requested for ${name.trim()} by ${session.user?.email}`,
      },
    });
    return created;
  });

  return NextResponse.json(offboardingRequest, { status: 201 });
}
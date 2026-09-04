import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.onboardingRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, title, department, startDate, manager } = body;
  if (![name, title, department, startDate, manager].every((value) => typeof value === "string" && value.trim())) {
    return NextResponse.json({ error: "All onboarding fields are required." }, { status: 400 });
  }
  const parsedStartDate = new Date(startDate);
  if (Number.isNaN(parsedStartDate.getTime())) {
    return NextResponse.json({ error: "Start date is invalid." }, { status: 400 });
  }
  const onboardingRequest = await prisma.$transaction(async (tx) => {
    const created = await tx.onboardingRequest.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        department: department.trim(),
        startDate: parsedStartDate.toISOString(),
        manager: manager.trim(),
        status: 'Pending',
      },
    });
    await tx.auditLog.create({
      data: {
        action: 'CREATED',
        entity: 'OnboardingRequest',
        entityId: created.id,
        details: `Onboarding requested for ${name.trim()} by ${session.user?.email}`,
      },
    });
    return created;
  });
  return NextResponse.json(onboardingRequest, { status: 201 });
}
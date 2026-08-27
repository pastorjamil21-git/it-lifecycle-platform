import { NextResponse } from "next/server";
import { createRequest, listRequests } from "@/lib/onboarding-store";

export async function GET() {
  return NextResponse.json(await listRequests());
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, title, department, startDate, manager } = body;

  if (![name, title, department, startDate, manager].every((value) => typeof value === "string" && value.trim())) {
    return NextResponse.json({ error: "All onboarding fields are required." }, { status: 400 });
  }

  const parsedStartDate = new Date(startDate);
  if (Number.isNaN(parsedStartDate.getTime())) {
    return NextResponse.json({ error: "Start date is invalid." }, { status: 400 });
  }

  const onboardingRequest = await createRequest({
    name: name.trim(), title: title.trim(), department: department.trim(),
    startDate: parsedStartDate.toISOString(), manager: manager.trim(),
  });

  return NextResponse.json(onboardingRequest, { status: 201 });
}
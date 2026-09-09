import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ALLOWED_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER"];

function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "9") + "!A1";
}

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

    const existing = await prisma.onboardingRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Request not found." }, { status: 404 });
    }
    if (!existing.email) {
      return NextResponse.json(
        { error: "This request has no email on file and cannot be approved into an account." },
        { status: 400 }
      );
    }

    let tempPassword: string | null = null;

    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: existing.email! } });

      if (!user) {
        tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        user = await tx.user.create({
          data: {
            name: existing.name,
            email: existing.email!,
            password: hashedPassword,
            role: "EMPLOYEE",
            isActive: true,
          },
        });
      }

      const updated = await tx.onboardingRequest.update({
        where: { id },
        data: { status: "Approved", userId: user.id },
      });

      await tx.auditLog.create({
        data: {
          action: "APPROVED",
          entity: "OnboardingRequest",
          entityId: id,
          details: `Onboarding request approved for ${updated.name}${tempPassword ? " (account created)" : " (existing account linked)"} by ${session.user?.email}`,
        },
      });

      return { onboardingRequest: updated, userId: user.id };
    });

    return NextResponse.json({
      ...result.onboardingRequest,
      tempPassword,
    });
  } catch (error) {
    console.error("Failed to approve request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";

const ALLOWED_ROLES = ["ADMIN"];
const VALID_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER", "EMPLOYEE"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessionRole = (session.user as any).role;
  if (!ALLOWED_ROLES.includes(sessionRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { role, isActive } = body;

  if (role !== undefined && !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const data: { role?: string; isActive?: boolean } = {};
  const changes: string[] = [];
  if (role !== undefined && role !== targetUser.role) {
    data.role = role;
    changes.push(`role changed to ${role}`);
  }
  if (isActive !== undefined && isActive !== targetUser.isActive) {
    data.isActive = isActive;
    changes.push(isActive ? "reactivated" : "deactivated");
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(targetUser);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({ where: { id }, data });
    await tx.auditLog.create({
      data: {
        action: "UPDATED",
        entity: "User",
        entityId: id,
        details: `${targetUser.name}: ${changes.join(", ")} by ${session.user?.email}`,
      },
    });
    return result;
  });

  return NextResponse.json(updated);
}
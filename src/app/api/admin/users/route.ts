import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ALLOWED_ROLES = ["ADMIN"];
const VALID_ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER", "EMPLOYEE"];

function generateTempPassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[+/=]/g, "9") + "!A1";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as any).role;
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, userRole } = body;

  if (!name?.trim() || !email?.trim() || !VALID_ROLES.includes(userRole)) {
    return NextResponse.json({ error: "Name, email, and a valid role are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
  }

  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: userRole,
        isActive: true,
      },
    });
    await tx.auditLog.create({
      data: {
        action: "CREATED",
        entity: "User",
        entityId: created.id,
        details: `User account created for ${created.name} (${created.role}) by ${session.user?.email}`,
      },
    });
    return created;
  });

  return NextResponse.json({ ...user, tempPassword }, { status: 201 });
}
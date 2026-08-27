import { prisma } from "@/lib/prisma";

export type OnboardingStatus = "Pending" | "Approved" | "Provisioning";

export type OnboardingRequest = {
  id: string;
  name: string;
  title: string;
  department: string;
  startDate: string;
  manager: string;
  status: OnboardingStatus;
};

export async function listRequests() {
  return prisma.onboardingRequest.findMany({
    orderBy: { startDate: "asc" },
  });
}

export async function createRequest(input: Omit<OnboardingRequest, "id" | "status">) {
  return prisma.onboardingRequest.create({
    data: {
      ...input,
      startDate: new Date(input.startDate),
    },
  });
}

export async function approveRequest(id: string) {
  return prisma.$transaction(async (transaction) => {
    const request = await transaction.onboardingRequest.findUnique({ where: { id } });
    if (!request) return undefined;

    const approvedRequest = await transaction.onboardingRequest.update({
      where: { id },
      data: { status: "Approved" },
    });

    await transaction.auditLog.create({
      data: {
        action: "Approved",
        entity: "OnboardingRequest",
        entityId: id,
        details: `Onboarding request for ${request.name} approved.`,
      },
    });

    return approvedRequest;
  });
}
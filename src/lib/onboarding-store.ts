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

const requests: OnboardingRequest[] = [];

export function listRequests() {
  return [...requests].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function createRequest(input: Omit<OnboardingRequest, "id" | "status">) {
  const request = { ...input, id: crypto.randomUUID(), status: "Pending" as const };
  requests.push(request);
  return request;
}

export function approveRequest(id: string) {
  const request = requests.find((item) => item.id === id);
  if (!request) return undefined;
  request.status = "Approved";
  return request;
}
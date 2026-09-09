"use client";
import { useEffect, useState } from "react";
type Status = "Pending" | "Approved" | "Rejected" | "Provisioning" | "Completed";
type Request = { id: string; name: string; title: string; department: string; startDate: string; manager: string; status: Status; email?: string | null };
const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
  Provisioning: "bg-sky-100 text-sky-800",
  Completed: "bg-violet-100 text-violet-800",
};
export default function LifecycleDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tempCredential, setTempCredential] = useState<{ email: string; password: string } | null>(null);
  async function loadRequests() {
    try {
      const response = await fetch("/api/onboarding", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load onboarding requests.");
      setRequests(await response.json());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load onboarding requests.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void loadRequests(); }, []);
  async function approve(id: string, email: string | null | undefined) {
    const response = await fetch(`/api/onboarding/${id}/approve`, { method: "POST" });
    if (response.ok) {
      const data = await response.json();
      if (data.tempPassword && email) {
        setTempCredential({ email, password: data.tempPassword });
      }
      await loadRequests();
    }
  }
  async function updateStatus(id: string, status: Status) {
    const response = await fetch(`/api/onboarding/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (response.ok) await loadRequests();
  }
  function handleReject(id: string, name: string) {
    if (confirm(`Reject the onboarding request for ${name}? This cannot be undone.`)) {
      void updateStatus(id, "Rejected");
    }
  }
  return (
    <section aria-labelledby="lifecycle-heading">
      {tempCredential && (
        <div className="mb-4 border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">Account created for {tempCredential.email}</p>
          <p className="mt-1">Temporary password: <span className="font-mono font-bold">{tempCredential.password}</span></p>
          <p className="mt-1 text-xs">Share this securely with the new hire. It will not be shown again.</p>
          <button onClick={() => setTempCredential(null)} className="mt-2 text-xs font-bold underline">Dismiss</button>
        </div>
      )}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">Lifecycle overview</p><h2 id="lifecycle-heading" className="mt-2 text-2xl font-semibold text-slate-950">Onboarding requests</h2></div>
        <span className="border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">{requests.length} total</span>
      </div>
      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-300"><tr>{["New hire", "Department", "Start date", "Manager", "Status", "Action"].map((heading) => <th key={heading} className="px-5 py-4 font-semibold">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Loading requests...</td></tr> : error ? <tr><td colSpan={6} className="px-5 py-10 text-center text-red-600">{error}</td></tr> : requests.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No onboarding requests yet.</td></tr> : requests.map((request) => <tr key={request.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{request.name}</div><div className="mt-1 text-xs text-slate-500">{request.title}</div></td><td className="px-5 py-4 text-slate-600">{request.department}</td><td className="px-5 py-4 text-slate-600">{new Date(request.startDate).toLocaleDateString()}</td><td className="px-5 py-4 text-slate-600">{request.manager}</td><td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${statusStyles[request.status]}`}>{request.status}</span></td><td className="px-5 py-4">
            {request.status === "Pending" && <div className="flex gap-2"><button onClick={() => void approve(request.id, request.email)} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700">Approve</button><button onClick={() => handleReject(request.id, request.name)} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-red-600 hover:text-red-700">Reject</button></div>}
            {request.status === "Approved" && <button onClick={() => void updateStatus(request.id, "Provisioning")} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-sky-600 hover:text-sky-700">Start Provisioning</button>}
            {request.status === "Provisioning" && <button onClick={() => void updateStatus(request.id, "Completed")} className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-violet-600 hover:text-violet-700">Mark Completed</button>}
          </td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
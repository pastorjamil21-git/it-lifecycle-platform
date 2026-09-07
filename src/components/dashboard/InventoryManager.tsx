"use client";

import { useEffect, useState } from "react";

type Hardware = { id: string; serialNumber: string; modelName: string; status: string };
type License = { id: string; softwareName: string; totalSeats: number; availableSeats: number };
type UserOption = { id: string; name: string; email: string; role: string };
type Assignment = {
  id: string;
  assignedAt: string;
  license: { softwareName: string };
  user: { name: string; email: string };
  hardwareAsset: { modelName: string; serialNumber: string } | null;
};

export default function InventoryManager() {
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState("");
  const [selectedLicense, setSelectedLicense] = useState("");
  const [selectedHardware, setSelectedHardware] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 403) {
          setError("You don't have permission to view inventory.");
        } else {
          setError("Failed to load inventory.");
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      setHardware(data.hardware);
      setLicenses(data.licenses);
      setUsers(data.users);
      setAssignments(data.assignments);
    } catch {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!selectedUser || !selectedLicense) {
      setFormError("Please select a user and a license.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          licenseId: selectedLicense,
          hardwareAssetId: selectedHardware || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Assignment failed.");
        return;
      }
      setSelectedUser("");
      setSelectedLicense("");
      setSelectedHardware("");
      await loadData();
    } catch {
      setFormError("Assignment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading inventory...</p>;
  }

  if (error) {
    return <p className="text-sm text-slate-500">{error}</p>;
  }

  const availableHardware = hardware.filter((h) => h.status === "AVAILABLE");
  const availableLicenses = licenses.filter((l) => l.availableSeats > 0);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleAssign}
        className="border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Assign to user</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select a user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              License
            </label>
            <select
              value={selectedLicense}
              onChange={(e) => setSelectedLicense(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select a license</option>
              {availableLicenses.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.softwareName} ({l.availableSeats} seats left)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Hardware (optional)
            </label>
            <select
              value={selectedHardware}
              onChange={(e) => setSelectedHardware(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">No hardware</option>
              {availableHardware.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.modelName} ({h.serialNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {submitting ? "Assigning..." : "Assign"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            Hardware inventory
          </h3>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {hardware.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-2 text-slate-800">{h.modelName}</td>
                  <td className="px-4 py-2 text-slate-500">{h.serialNumber}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-bold ${
                        h.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
            License inventory
          </h3>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100">
              {licenses.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-2 text-slate-800">{l.softwareName}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {l.availableSeats} / {l.totalSeats} seats
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          Current assignments
        </h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">License</th>
              <th className="px-4 py-3">Hardware</th>
              <th className="px-4 py-3">Assigned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No assignments yet.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-slate-800">{a.user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{a.license.softwareName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {a.hardwareAsset ? `${a.hardwareAsset.modelName} (${a.hardwareAsset.serialNumber})` : "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(a.assignedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
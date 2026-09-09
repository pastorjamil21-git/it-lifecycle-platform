"use client";

import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const ROLES = ["ADMIN", "IT_TECH", "HR_MANAGER", "EMPLOYEE"];

export default function UserManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCredential, setNewCredential] = useState<{ email: string; password: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 403 ? "You don't have permission to view this page." : "Failed to load users.");
        setLoading(false);
        return;
      }
      setUsers(await res.json());
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, userRole: role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create user.");
        return;
      }
      setNewCredential({ email: data.email, password: data.tempPassword });
      setName("");
      setEmail("");
      setRole("EMPLOYEE");
      await loadUsers();
    } catch {
      setFormError("Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser(id: string, changes: { role?: string; isActive?: boolean }) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (res.ok) await loadUsers();
  }

  function handleToggleActive(u: UserRow) {
    const action = u.isActive ? "deactivate" : "reactivate";
    if (confirm(`Are you sure you want to ${action} ${u.name}?`)) {
      void updateUser(u.id, { isActive: !u.isActive });
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading users...</p>;
  if (error) return <p className="text-sm text-slate-500">{error}</p>;

  return (
    <div className="space-y-8">
      {newCredential && (
        <div className="border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-bold">Account created for {newCredential.email}</p>
          <p className="mt-1">
            Temporary password: <span className="font-mono font-bold">{newCredential.password}</span>
          </p>
          <p className="mt-1 text-xs">Share this securely. It will not be shown again.</p>
          <button onClick={() => setNewCredential(null)} className="mt-2 text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Create a new user</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
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
          {submitting ? "Creating..." : "Create user"}
        </button>
      </form>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-300">
            <tr>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Email</th>
              <th className="px-5 py-4 font-semibold">Role</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-900">{u.name}</td>
                <td className="px-5 py-4 text-slate-600">{u.email}</td>
                <td className="px-5 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => void updateUser(u.id, { role: e.target.value })}
                    className="border border-slate-300 px-2 py-1 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex px-2.5 py-1 text-xs font-bold ${
                      u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-900"
                  >
                    {u.isActive ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
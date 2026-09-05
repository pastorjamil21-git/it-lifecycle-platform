"use client";

import { useEffect, useState } from "react";

type AuditLogEntry = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
};

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/audit-logs");
        if (!res.ok) {
          if (res.status === 403) {
            setError("You don't have permission to view audit logs.");
          } else {
            setError("Failed to load audit logs.");
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLogs(data);
      } catch {
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading audit log...</p>;
  }

  if (error) {
    return <p className="text-sm text-slate-500">{error}</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-slate-500">No activity recorded yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
          <tr>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3">When</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
              <td className="px-4 py-3 text-slate-600">{log.details || "-"}</td>
              <td className="px-4 py-3 text-slate-500">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
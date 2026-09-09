"use client";
import { FormEvent, useEffect, useState } from "react";
type UserOption = { id: string; name: string; email: string; role: string };
type FormValues = {
  userId: string;
  title: string;
  department: string;
  lastWorkingDay: string;
  manager: string;
};
const initialValues: FormValues = { userId: "", title: "", department: "", lastWorkingDay: "", manager: "" };
export default function OffboardingForm() {
  const [values, setValues] = useState(initialValues);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]));
  }, []);
  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/offboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to submit request.");
      setValues(initialValues);
      setMessage("Request submitted. It is now pending approval.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit request.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <section className="border-t-4 border-red-400 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="offboarding-request-heading">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">New request</p>
        <h2 id="offboarding-request-heading" className="mt-2 text-2xl font-semibold text-slate-950">Start an offboarding</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Let IT prepare a smooth, secure departure.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Employee</span>
            <select required value={values.userId} onChange={(event) => updateValue("userId", event.target.value)} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100">
              <option value="">Select an employee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </label>
          {(["title", "department", "manager"] as const).map((field) => (
            <label key={field} className="space-y-2 text-sm font-semibold text-slate-700">
              <span>{field[0].toUpperCase() + field.slice(1)}</span>
              <input required value={values[field]} onChange={(event) => updateValue(field, event.target.value)} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
          ))}
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Last working day</span>
            <input required type="date" value={values.lastWorkingDay} onChange={(event) => updateValue("lastWorkingDay", event.target.value)} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" />
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p role="status" className="text-sm text-slate-500">{message}</p>
          <button disabled={submitting} className="shrink-0 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </section>
  );
}
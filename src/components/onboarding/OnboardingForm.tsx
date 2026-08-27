"use client";

import { FormEvent, useState } from "react";

type FormValues = {
  name: string;
  title: string;
  department: string;
  startDate: string;
  manager: string;
};

const initialValues: FormValues = { name: "", title: "", department: "", startDate: "", manager: "" };

export default function OnboardingForm() {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function updateValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/onboarding", {
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
    <section className="border-t-4 border-amber-400 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="new-request-heading">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">New request</p>
        <h2 id="new-request-heading" className="mt-2 text-2xl font-semibold text-slate-950">Start a new onboarding</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Give IT the details they need to prepare a great first day.</p>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {(["name", "title", "department", "manager"] as const).map((field) => (
            <label key={field} className="space-y-2 text-sm font-semibold text-slate-700">
              <span>{field === "name" ? "Full name" : field[0].toUpperCase() + field.slice(1)}</span>
              <input required value={values[field]} onChange={(event) => updateValue(field, event.target.value)} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
            </label>
          ))}
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            <span>Start date</span>
            <input required type="date" value={values.startDate} onChange={(event) => updateValue("startDate", event.target.value)} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <p role="status" className="text-sm text-slate-500">{message}</p>
          <button disabled={submitting} className="shrink-0 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </form>
    </section>
  );
}
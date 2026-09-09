import AppHeader from "@/components/auth/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <AppHeader />
        <div className="border-t-4 border-amber-400 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Welcome</h2>
          <p className="mt-3 text-slate-600">
            Use the navigation above to manage onboarding, offboarding, inventory, and the audit trail.
          </p>
        </div>
      </div>
    </main>
  );
}
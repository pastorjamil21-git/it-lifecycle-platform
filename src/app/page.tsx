import LifecycleDashboard from "@/components/dashboard/LifecycleDashboard";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import UserMenu from "@/components/auth/UserMenu";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <header className="mb-12 flex max-w-none items-start justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">People operations / IT</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">A better first day starts here.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">Coordinate every new hire&apos;s journey from request to ready-to-work.</p>
          </div>
          <UserMenu />
        </header>
        <div className="space-y-14"><OnboardingForm /><LifecycleDashboard /></div>
      </div>
    </main>
  );
}
import AppHeader from "@/components/auth/AppHeader";
import OffboardingForm from "@/components/offboarding/OffboardingForm";
import OffboardingDashboard from "@/components/offboarding/OffboardingDashboard";

export default function OffboardingPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <AppHeader />
        <div className="space-y-14">
          <OffboardingForm />
          <OffboardingDashboard />
        </div>
      </div>
    </main>
  );
}
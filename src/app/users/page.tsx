import AppHeader from "@/components/auth/AppHeader";
import UserManager from "@/components/admin/UserManager";

export default function UsersPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <AppHeader />
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Administration</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">User management</h2>
          <div className="mt-4">
            <UserManager />
          </div>
        </section>
      </div>
    </main>
  );
}
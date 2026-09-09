import AppHeader from "@/components/auth/AppHeader";
import InventoryManager from "@/components/dashboard/InventoryManager";

export default function InventoryPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-16">
        <AppHeader />
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">IT inventory</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Device & license assignments</h2>
          <div className="mt-4">
            <InventoryManager />
          </div>
        </section>
      </div>
    </main>
  );
}
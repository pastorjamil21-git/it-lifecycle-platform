import UserMenu from "@/components/auth/UserMenu";
import Nav from "@/components/auth/Nav";

export default function AppHeader() {
  return (
    <header className="mb-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">People operations / IT</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">IT Lifecycle Platform</h1>
        </div>
        <UserMenu />
      </div>
      <Nav />
    </header>
  );
}
"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as { name?: string | null; email?: string | null; role?: string };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="text-right">
        <p className="font-medium text-slate-800">{user.name || user.email}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      >
        Sign out
      </button>
    </div>
  );
}
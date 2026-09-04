import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/auth/SessionProvider";

export const metadata: Metadata = {
  title: "Lifecycle | Onboarding",
  description: "Manage employee onboarding requests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
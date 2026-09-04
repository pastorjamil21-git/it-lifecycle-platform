import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname === "/login";
      const isAuthApiRoute = request.nextUrl.pathname.startsWith("/api/auth");

      if (isLoginPage || isAuthApiRoute) {
        return true; // always allow
      }

      return isLoggedIn; // everything else requires login
    },
  },
  providers: [], // providers are added in the full auth.ts, not here
};
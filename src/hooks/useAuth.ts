"use client";

import { useAppStore } from "@/store/useAppStore";
import { mockLogin } from "@/services/auth.service";

// ─── Roles that belong to the CRO / Researcher flow ──────────────────────────
// Exported so Sidebar, TopNav, and guards can all share the same definition
// without duplicating the set literal.
export const RESEARCHER_ROLES = new Set<string>([
  "cro",
  "scientist",
  "researcher",
  "pi",
]);

/**
 * Returns the correct post-logout login URL for a given role.
 *
 * Rules:
 *   manufacturing         → /login          (Manufacturer login)
 *   cro | scientist |
 *   researcher | pi       → /login/cro-scientist
 *   unknown / undefined   → /login          (safe fallback)
 *
 * profileSubtype is checked first because role can be stale in persisted
 * localStorage (e.g. old sessions that had role:"manufacturing" before the
 * role-override logic was added to CROScientistLoginPage).
 */
export function getLogoutRedirect(role?: string, profileSubtype?: string): string {
  const effective = profileSubtype || role;
  return effective && RESEARCHER_ROLES.has(effective) ? "/login/cro-scientist" : "/login";
}

/**
 * Auth hook — wraps the auth slice of the store.
 * Keeps business logic out of components.
 * Logic is DOM-free and reusable in Expo React Native.
 */
export function useAuth() {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isLoading = useAppStore((s) => s.isLoading);
  const setUser = useAppStore((s) => s.setUser);
  const setLoading = useAppStore((s) => s.setLoading);
  const logout = useAppStore((s) => s.logout);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const loggedInUser = await mockLogin(email, password);
      setUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const signout = () => logout();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signout,
    setUser,
  };
}

/**
 * Mock Auth Service
 *
 * All methods simulate async API calls with realistic delays.
 * Replace each function body with a real fetch/axios call when connecting to a backend.
 */

import type { User, UserRole } from "@/types";

const MOCK_DELAY = 800;
const delay = (ms = MOCK_DELAY) => new Promise((r) => setTimeout(r, ms));

// ─── Mock user store (simulates a server-side user table) ─────────────────────

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "cro@demo.com": {
    password: "Demo1234",
    user: {
      id: "usr_cro_001",
      email: "cro@demo.com",
      name: "Aria Mehta",
      role: "cro",
      organization: "PharmaPath CRO",
      profileCompletion: 78,
      createdAt: "2025-01-15",
    },
  },
  "mfg@demo.com": {
    password: "Demo1234",
    user: {
      id: "usr_mfg_001",
      email: "mfg@demo.com",
      name: "Rajan Sinha",
      role: "manufacturing",
      organization: "BioSynth Facility",
      profileCompletion: 65,
      createdAt: "2025-02-10",
    },
  },
  "sci@demo.com": {
    password: "Demo1234",
    user: {
      id: "usr_sci_001",
      email: "sci@demo.com",
      name: "Dr. Priya Iyer",
      role: "scientist",
      profileCompletion: 92,
      createdAt: "2025-03-01",
    },
  },
};

// ─── Login ────────────────────────────────────────────────────────────────────

export async function mockLogin(email: string, password: string): Promise<User> {
  await delay();

  const record = DEMO_USERS[email.toLowerCase()];

  // Any non-demo email is accepted with any password (generic signup simulation).
  // We intentionally do NOT default to "manufacturing" here — the login page
  // (CROScientistLoginPage or ManufacturerLoginPage) is responsible for setting
  // the correct role via setUser() after login. "cro" is used as a neutral
  // researcher-side fallback so role-based guards don't misfire.
  if (!record) {
    const role: UserRole = email.includes("mfg") || email.includes("manuf")
      ? "manufacturing"
      : email.includes("sci")
      ? "scientist"
      : email.includes("cro")
      ? "cro"
      : "researcher";

    return {
      id: `usr_${Date.now()}`,
      email,
      name: "New User",
      role,
      profileCompletion: 40,
      createdAt: new Date().toISOString(),
    };
  }

  if (record.password !== password) {
    throw new Error("Invalid credentials");
  }

  return record.user;
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function mockSignup(
  email: string,
  _password: string,
  role: UserRole,
  profileData: Record<string, unknown>
): Promise<User> {
  await delay(1000);

  const name =
    role === "scientist"
      ? `${(profileData.title as string) ?? ""} ${(profileData.fullName as string) ?? "User"}`.trim()
      : role === "manufacturing"
      ? (profileData.facilityName as string) ?? "Facility User"
      : (profileData.organizationName as string) ?? "CRO User";

  return {
    id: `usr_${Date.now()}`,
    email,
    name,
    role,
    organization: (profileData.organizationName as string) ?? (profileData.facilityName as string),
    profileCompletion: 60,
    createdAt: new Date().toISOString(),
  };
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function mockForgotPassword(email: string): Promise<void> {
  await delay();
  // In production: POST /auth/forgot-password { email }
  // Server sends a reset link to the email
  console.info(`[mock] Password reset link sent to: ${email}`);
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function mockResetPassword(
  newPassword: string,
  _token?: string
): Promise<void> {
  await delay();
  // In production: POST /auth/reset-password { token, newPassword }
  console.info(`[mock] Password reset successfully (length: ${newPassword.length})`);
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function mockChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await delay();

  // Simulate wrong current password for demo credentials
  if (currentPassword === "wrong") {
    throw new Error("Incorrect current password");
  }

  console.info(
    `[mock] Password changed. Old: ${currentPassword.length} chars → New: ${newPassword.length} chars`
  );
}

// ─── Change Email ─────────────────────────────────────────────────────────────

export async function mockChangeEmail(
  newEmail: string,
  currentPassword: string
): Promise<void> {
  await delay();

  if (currentPassword === "wrong") {
    throw new Error("Incorrect password");
  }

  // In production: POST /auth/change-email { newEmail, password }
  // Server sends verification to newEmail; old email receives security notice
  console.info(`[mock] Email change initiated → ${newEmail}`);
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, UserRole, PreviewMode, SignupFlowState } from "@/types";

// ─── Auth Slice ───────────────────────────────────────────────────────────────

interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Profile sub-type chosen during CRO/Scientist signup — bridges signup → login */
  pendingProfileType: "researcher" | "pi" | "others" | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setPendingProfileType: (type: "researcher" | "pi" | "others" | null) => void;
  logout: () => void;
}

// ─── Signup Slice ─────────────────────────────────────────────────────────────

interface SignupSlice {
  signup: SignupFlowState;
  setSignupRole: (role: UserRole) => void;
  setSignupStep: (step: number) => void;
  updateSignupData: (data: Record<string, unknown>) => void;
  resetSignup: () => void;
}

// ─── UI Slice ─────────────────────────────────────────────────────────────────

interface UISlice {
  previewMode: PreviewMode;
  sidebarOpen: boolean;
  setPreviewMode: (mode: PreviewMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = AuthSlice & SignupSlice & UISlice;

const initialSignupState: SignupFlowState = {
  role: null,
  step: 0,
  formData: {},
  isComplete: false,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, _get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingProfileType: null,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setLoading: (loading) => set({ isLoading: loading }),

      setPendingProfileType: (type) => set({ pendingProfileType: type }),

      // On logout, preserve profileSubtype as pendingProfileType so the
      // CRO/Scientist login screen can re-highlight the correct card.
      logout: () =>
        set((state) => ({
          user: null,
          isAuthenticated: false,
          pendingProfileType: (state.user?.profileSubtype as "researcher" | "pi" | "others" | null) ?? null,
        })),

      // Signup
      signup: initialSignupState,

      setSignupRole: (role) =>
        set((state) => ({
          signup: { ...state.signup, role, step: 1, formData: {} },
        })),

      setSignupStep: (step) =>
        set((state) => ({
          signup: { ...state.signup, step },
        })),

      updateSignupData: (data) =>
        set((state) => ({
          signup: {
            ...state.signup,
            formData: { ...state.signup.formData, ...data },
          },
        })),

      resetSignup: () =>
        set({ signup: initialSignupState }),

      // UI
      previewMode: "web",
      sidebarOpen: true,

      setPreviewMode: (mode) => set({ previewMode: mode }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "scinode-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        previewMode: state.previewMode,
        pendingProfileType: state.pendingProfileType,
      }),
    }
  )
);

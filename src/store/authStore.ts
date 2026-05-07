import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { User, DecodedToken, UserRole } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setToken: (token: string | null) => void;
  logout: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setToken: (token: string | null) => {
        if (!token) {
          set({ token: null, user: null, isAuthenticated: false });
          return;
        }

        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const user: User = {
            username: decoded.sub,
            role: decoded.role,
          };
          set({ token, user, isAuthenticated: true });
        } catch (error) {
          console.error("Invalid token", error);
          set({ token: null, user: null, isAuthenticated: false });
        }
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage"); // Clear persistence if needed
      },
      setHasHydrated: (val: boolean) => set({ hasHydrated: val }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);

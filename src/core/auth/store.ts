import { create } from "zustand";

export interface AuthUser {
  username: string;
  fullName: string;
  role: "user";
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: () => {
    return get().user !== null;
  },
}));

import { create } from "zustand";

export interface IAuthUser {
  username: string;
  fullName: string;
  role: "user";
}

interface IAuthState {
  user: IAuthUser | null;
  setUser: (user: IAuthUser | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<IAuthState>()((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAuthenticated: () => {
    return get().user !== null;
  },
}));

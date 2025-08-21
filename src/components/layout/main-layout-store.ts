import { MENUS, type MyMenu } from "@/config/menu";
import { create } from "zustand";

interface State {
  selectedMenu: MyMenu;
  setSelectedMenu: (menu: MyMenu) => void;
}

export const useMainLayoutStore = create<State>()((set) => ({
  selectedMenu: MENUS[0], // Default value, should be updated later
  setSelectedMenu: (menu) => set({ selectedMenu: menu }),
}));

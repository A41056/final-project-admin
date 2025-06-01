import { create } from "zustand";

interface DarkModeState {
  darkMode: boolean;
  toggleDarkMode: (value?: boolean) => void;
}

export const useDarkModeStore = create<DarkModeState>((set) => ({
  darkMode: false,
  toggleDarkMode: (value) =>
    set((state) => {
      const newValue = value !== undefined ? value : !state.darkMode;
      localStorage.setItem("darkMode", newValue.toString());
      return { darkMode: newValue };
    }),
}));

export const initDarkMode = () => {
  const saved = localStorage.getItem("darkMode");
  const enabled = saved === "true";
  useDarkModeStore.setState({ darkMode: enabled });
};
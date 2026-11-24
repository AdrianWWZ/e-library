import { createContext, useContext } from "react";

// Saved per device in localStorage
export const SETTINGS_STORAGE_KEY = "elibrary-settings";

export const DEFAULT_SETTINGS = {
  theme: "dark", // "dark" | "light"
  showProgress: true, // show the % badge on book covers
  sort: "recent", // see SORT_OPTIONS in utils/books.js
};

export const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
};

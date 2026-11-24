import { useEffect, useMemo, useState } from "react";
import {
  SettingsContext,
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
} from "./settings";

const loadSettings = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}",
    );
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadSettings);

  // Apply the theme to <html> and remember everything for next visit
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Private browsing etc. - settings just won't persist
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      ...settings,
      toggleTheme: () =>
        setSettings((s) => ({
          ...s,
          theme: s.theme === "dark" ? "light" : "dark",
        })),
      setShowProgress: (showProgress) =>
        setSettings((s) => ({ ...s, showProgress })),
      setSort: (sort) => setSettings((s) => ({ ...s, sort })),
    }),
    [settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;

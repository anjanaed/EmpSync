import React, { createContext, useContext, useEffect, useState } from "react";

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.style.setProperty("--secondary-color", "#232325");
      root.style.setProperty("--danger-color", "#ff1111");
      root.style.setProperty("--text-color", "#ffffff");
      root.style.setProperty("--icon-color", "#fff"); // icon color for dark mode
      root.style.setProperty("--table-bg-color", "#202020"); // dark table background
      root.style.setProperty("--table-cell-bg-color", "#2c2c2e"); // slightly lighter for cells
      root.style.setProperty("--table-row-hover-bg", "#1e40af"); // blue for dark mode
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("--secondary-color", "#fffbfb");
      root.style.setProperty("--danger-color", "#dc3545");
      root.style.setProperty("--text-color", "#000000");
      root.style.setProperty("--icon-color", "#222"); // icon color for light mode
      root.style.setProperty("--table-bg-color", "#ebebe8"); // light table background
      root.style.setProperty("--table-cell-bg-color", "#fff"); // white for cells
      root.style.setProperty("--table-row-hover-bg", "#e6f7ff"); // default Ant Design blue
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
export const useDarkMode = () => useContext(DarkModeContext);

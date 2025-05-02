import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Sidebar } from "./sidebar";
import { MobileNavigation } from "./mobile-navigation"; // Import MobileNavigation

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export function SidebarProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Render the sidebar for "user-portal" or "profile" routes
  const isSidebarVisible =
    location.pathname.includes("user-portal") || 
    location.pathname.includes("profile")  || 
    location.pathname.includes("attendance")||
    location.pathname.includes("meals")||
    location.pathname.includes("userpayroll2")||
    location.pathname.includes("suggestions");

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, activeTab }}>
      {isSidebarVisible ? (
        <div style={{ display: "flex", height: "100vh" }}>
          {isMobile ? (
            <MobileNavigation activeTab={activeTab} />
          ) : (
            <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} />
          )}
          <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
        </div>
      ) : (
        <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
      )}
    </SidebarContext.Provider>
  );
}
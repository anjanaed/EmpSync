import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    employeeId: null,
    name: null,
  });

  useEffect(() => {
    // Fetch user data from the backend
    async function fetchUserData() {
      try {
        const response = await fetch("/api/user"); // Replace with your API endpoint
        const data = await response.json();
        setUser({
          employeeId: data.emplocyeeId,
          name: data.name,
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
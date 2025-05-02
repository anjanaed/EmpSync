import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;
  const [authLoading, setAuthLoading] = useState(true);


  useEffect(() => {
    const stored = localStorage.getItem("authData");
    if (stored) {
      setAuthData(JSON.parse(stored));
    }
    setAuthLoading(false)
  }, []);

  const login = async ({ access_token, id_token }) => {
    try {
      const decoded = jwtDecode(id_token);
      const employeeId = decoded["https://empidReceiver.com"];

      const response = await axios.get(`${urL}/user/${employeeId.toUpperCase()}`);
      const currentUser = response.data;

      const userRole = currentUser.role;

      const userData = {
        accessToken: access_token,
        idToken: id_token,
        user: currentUser,
        email: decoded.email,
        role: userRole,
      };

      setAuthData(userData);
      localStorage.setItem("authData", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Failed to log in. Please check your credentials.");
    }
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem("authData"); // 🧹 Clear from localStorage
  };

  return (
    <AuthContext.Provider value={{ authData,authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);




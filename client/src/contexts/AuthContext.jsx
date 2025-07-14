import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [superAuthData, setSuperAuthData] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      const stored = localStorage.getItem("authData");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setAuthData(parsedData);
        } catch (error) {
          localStorage.removeItem("authData");
        }
      }
      setAuthLoading(false);
    };
    const loadSuperAuthData = async () => {
      const stored = localStorage.getItem("superAdminUserData");
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setSuperAuthData(parsedData);
        } catch (error) {
          localStorage.removeItem("superAdminUserData");
        }
      }
      setAuthLoading(false);
    };

    loadAuthData();
    loadSuperAuthData();
  }, []);

  const login = async ({ access_token, id_token }) => {
    try {
      const decoded = jwtDecode(id_token);
      const employeeId = decoded["https://empidReceiver.com"];

      const response = await axios.get(
        `${urL}/user/${employeeId.toUpperCase()}`
      );
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

  const superAdminLogin = async ({ access_token }) => {
    try {
      const superAdminUserData = {
        accessToken: access_token,
        role: "superadmin",
      };

      setSuperAuthData(superAdminUserData);
      localStorage.setItem("superAuthData", JSON.stringify(superAdminUserData));
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Failed to log in. Please check your credentials.");
    }
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem("authData");
  };

  const superLogout = () => {
    setSuperAuthData(null);
    localStorage.removeItem("superAdminUserData");
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        superAuthData,
        authLoading,
        login,
        superAdminLogin,
        logout,
        superLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

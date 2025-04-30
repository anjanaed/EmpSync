import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const urL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const stored = localStorage.getItem("authData");
    if (stored) {
      setAuthData(JSON.parse(stored));
    }
  }, []);

  const login = async ({ access_token, id_token }) => {
    const decoded = jwtDecode(id_token);
    const employeeId = decoded["https://empidReceiver.com"];

    const currentUser = await axios.get(
      `${urL}/user/${employeeId.toUpperCase()}`
    );

    const userData = {
      accessToken: access_token,
      idToken: id_token,
      user: currentUser,
      email: decoded.email,
    };

    setAuthData(userData);
    localStorage.setItem("authData", JSON.stringify(userData));
  };

  const logout = () => {
    setAuthData(null);
    localStorage.removeItem("authData"); // 🧹 Clear from localStorage
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

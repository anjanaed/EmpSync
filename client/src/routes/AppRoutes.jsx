import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PasswordReset from "../components/pages/Login/PasswordReset/PasswordReset";
import OrderTab from "../components/pages/OrderTab/OrderTab";
import PrivateRoutes from "./PrivateRoutes";
import { NotificationsProvider } from "../contexts/NotificationsContext";
import { PopupProvider } from "../contexts/PopupContext";


const AppRoutes = () => (
  <BrowserRouter>
    <NotificationsProvider>
      <PopupProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/OrderTab" element={<OrderTab />} />

          {/* Private Routes */}
          {PrivateRoutes()}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PopupProvider>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
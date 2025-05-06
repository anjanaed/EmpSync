import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
// import RootLayout from "../components/UserPortalUI/layout";
import PasswordReset from "../components/pages/PasswordReset/PasswordReset";
import OrderTab from "../pages/OrderTab/OrderTab";
import PrivateRoutes from "./PrivateRoutes";
import { NotificationsProvider } from "../contexts/NotificationsContext";
import { PopupProvider } from "../contexts/PopupContext";
// import ProfilePage from "../components/pages/UserAccount/ProfilePage/ProfilePage";

const AppRoutes = () => (
  <BrowserRouter>
    <NotificationsProvider>
      <PopupProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/passwordReset" element={<PasswordReset />} />
            <Route path="/OrderTab" element={<OrderTab />} />

            {/* Temp */}
            {/* <Route path="/Userprofile1" element={<ProfilePage />} /> */}

            {/* Private Routes */}
            {PrivateRoutes()}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </PopupProvider>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
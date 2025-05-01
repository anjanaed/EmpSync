import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import RootLayout from "../components/UserPortalUI/layout";
import Login from "../components/pages/Login/Login";
import LoginRole from "../components/pages/LoginRole/LoginRole";
import PasswordReset from "../components/pages/PasswordReset/PasswordReset";
import PrivateRoutes from "./PrivateRoutes";
import { Toaster } from "sonner";
import { NotificationsProvider } from "../contexts/NotificationsContext";

const AppRoutes = () => (
  <BrowserRouter>
    <Toaster richColors />
    <NotificationsProvider>
      <RootLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/LoginRole" element={<LoginRole />} />
          <Route path="/passwordReset" element={<PasswordReset />} />

          {/* Private Routes */}
          {PrivateRoutes()}
        </Routes>
      </RootLayout>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
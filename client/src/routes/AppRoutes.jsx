import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import RootLayout from "../components/UserPortalUI/layout";
import PasswordReset from "../components/pages/PasswordReset/PasswordReset";
import OrderTab from "../pages/OrderTab/OrderTab";
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
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/OrderTab" element={<OrderTab />} />

          {/* Private Routes */}
          {PrivateRoutes()}
        </Routes>
      </RootLayout>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
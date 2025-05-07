import React from "react";
import { Routes, Route, BrowserRouter,Navigate } from "react-router-dom";
import RootLayout from "../components/UserPortalUI/layout";
import PasswordReset from "../components/pages/PasswordReset/PasswordReset";
import OrderTab from "../pages/OrderTab/OrderTab";
import PrivateRoutes from "./PrivateRoutes";
import { NotificationsProvider } from "../contexts/NotificationsContext";
import { PopupProvider } from "../contexts/PopupContext";

import KitchenStaff from "../components/pages/kitchen staff/kitchenStaff";

const AppRoutes = () => (
  <BrowserRouter>
    <NotificationsProvider>
      <PopupProvider>
      <RootLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/OrderTab" element={<OrderTab />} />

          <Route path="/kitchenStaff" element={<KitchenStaff />} />

          {/* Private Routes */}
          {PrivateRoutes()}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </RootLayout>
      </PopupProvider>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
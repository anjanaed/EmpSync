import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PasswordReset from "../components/pages/Login/PasswordReset/PasswordReset";
import FingerPrintPage from '../components/pages/HR/FingerPrintPage/FingerPrintPage';
import OrderTab from "../components/pages/OrderTab/OrderTab";

import UserFingerPrintRegister from '../components/organisms/OrderTabUI/UserFingerPrintRegister/UserFingerPrintRegister';
import MealPage03 from '../components/organisms/UserPortal/MealPage03/MealPage03';
import PrivateRoutes from "./PrivateRoutes";
import { NotificationsProvider } from "../contexts/NotificationsContext";
import { PopupProvider } from "../contexts/PopupContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import FingerPrints from '../components/organisms/HR/FingerPrints/FingerPrints';



const AppRoutes = () => (
  <BrowserRouter>

    <NotificationsProvider>
      <PopupProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/OrderTab" element={<OrderTab />} />
          <Route path="/user-fingerprint-register" element={<UserFingerPrintRegister />} />
          <Route path="/MealPage03" element={<MealPage03 />} />
          {PrivateRoutes()}
          <Route path="/fingerprint" element={<FingerPrintPage />} />
          <Route path="/FingerPrints" element={<FingerPrints />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PopupProvider>
    </NotificationsProvider>

  </BrowserRouter>
);

export default AppRoutes;
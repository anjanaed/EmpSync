import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PasswordReset from "../components/pages/Login/PasswordReset/PasswordReset.jsx";
import FingerPrintPage from '../components/pages/HR/FingerPrintPage/FingerPrintPage.jsx';
import OrderTab from "../components/pages/OrderTab/OrderTab.jsx";

import UserFingerPrintRegister from '../components/organisms/OrderTabUI/UserFingerPrintRegister/UserFingerPrintRegister.jsx';
import MealPage03 from '../components/organisms/UserPortal/MealPage03/MealPage03.jsx';
import PrivateRoutes from "./PrivateRoutes.jsx";
import { NotificationsProvider } from "../contexts/NotificationsContext.jsx";
import { PopupProvider } from "../contexts/PopupContext.jsx";
import { ThemeProvider } from "../contexts/ThemeContext.jsx";
import { MealDataProvider } from "../contexts/MealDataContext.jsx";
import FingerPrints from '../components/organisms/HR/FingerPrints/FingerPrints.jsx';




const AppRoutes = () => (
  <BrowserRouter>

    <NotificationsProvider>
      <PopupProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/OrderTab" element={<OrderTab />} />
          <Route path="/user-fingerprint-register" element={<UserFingerPrintRegister />} />
          <Route path="/MealPage03" element={
            <MealDataProvider>
              <MealPage03 />
            </MealDataProvider>
          } />
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
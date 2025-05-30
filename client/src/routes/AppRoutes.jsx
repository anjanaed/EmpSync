import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PasswordReset from "../components/pages/Login/PasswordReset/PasswordReset";
import OrderTab from "../components/pages/OrderTab/OrderTab";
import KitchenAdmin from "../components/pages/KitchenAdmin/SchedulePage/KitchenAdmin";
import Meals from "../components/pages/KitchenAdmin/MealPage/Meal";
import MealDetailsForm from "../components/pages/KitchenAdmin/AddMealPage/AddMeal";
import EditMeal from "../components/pages/KitchenAdmin/EditMealPage/EditMeal";
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
          <Route path="/kitchen-admin" element={<KitchenAdmin />} />
          <Route path="/kitchen-meal" element={<Meals />} />
          <Route path="/meal-details" element={<MealDetailsForm />} />
          <Route path="/edit-meal" element={<EditMeal />} />


          


          

          {/* Private Routes */}
          {PrivateRoutes()}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </PopupProvider>
    </NotificationsProvider>
  </BrowserRouter>
);

export default AppRoutes;
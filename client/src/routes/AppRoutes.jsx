import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import PasswordReset from "../components/pages/Login/PasswordReset/PasswordReset";
import FingerPrintPage from '../components/pages/HR/FingerPrintPage/FingerPrintPage';
import OrderTab from "../components/pages/OrderTab/OrderTab";
import SuperAdmin from "../components/pages/SuperAdmin/SuperAdmin";
import SuperAdminLogin from '../components/pages/Login/SuperAdmin/LoginPage/Login';
import Organizations from '../components/organisms/SuperAdmin/pages/Organizations/Organization List/OrganizationList';
import Roles from '../components/organisms/SuperAdmin/pages/Roles/RolesList';
import Permissions from '../components/organisms/SuperAdmin/pages/Permissions/PermissionsList';
import UserFingerPrintRegister from '../components/organisms/OrderTabUI/UserFingerPrintRegister/UserFingerPrintRegister';
import MealPage03 from '../components/organisms/UserPortal/MealPage03/MealPage03';
// import KitchenAdmin from "../components/pages/KitchenAdmin/SchedulePage/KitchenAdmin";
// import Meals from "../components/pages/KitchenAdmin/MealPage/Meal";
// import MealDetailsForm from "../components/pages/KitchenAdmin/AddMealPage/AddMeal";
// import EditMeal from "../components/pages/KitchenAdmin/EditMealPage/EditMeal";
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
          <Route path="/SuperAdmin/login" element={<SuperAdminLogin />} />
          <Route path="/SuperAdmin/dashboard" element={<SuperAdmin />}>
            <Route path="organizations" element={<Organizations />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
          </Route>
          <Route path="/user-fingerprint-register" element={<UserFingerPrintRegister />} />
          <Route path="/MealPage03" element={<MealPage03 />} />
          {/* <Route path="/kitchen-admin" element={<KitchenAdmin />} />
          <Route path="/kitchen-meal" element={<Meals />} />
          <Route path="/meal-details" element={<MealDetailsForm />} />
          <Route path="/edit-meal" element={<EditMeal />} /> */}         
          {/* Private Routes */}
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
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../../src/guards/ProtectedRoutes.jsx";
import SuperAdminProtectedRoute from "../../src/guards/SuperAdminProtectedRoute.jsx";
import LoginRole from "../components/pages/Login/LoginAsPage/LoginRole.jsx";
import Login from "../components/pages/Login/LoginPage/Login.jsx";

// HR_ADMIN
import EmployeePage from "../components/pages/HR/EmployeePage/EmployeePage.jsx";
import RegisterPage from "../components/pages/HR/RegisterPage/RegisterPage.jsx";
import PayrollPage from "../components/pages/HR/PayrollPage/PayrollPage.jsx";
import AdjustmentPage from "../components/pages/HR/AdjustmentPage/AdjustmentPage.jsx";
import PayslipPage from "../components/pages/HR/PayslipPage/PayslipPage.jsx";

// User Portal
import UserPayrollPage from "../components/pages/UserPortal/PayrollPage.jsx";

// KITCHEN_ADMIN
import KitchenAdmin from "../components/pages/KitchenAdmin/SchedulePage/KitchenAdmin.jsx";
import Reports from "../components/pages/KitchenAdmin/ReportPage/Report.jsx";
import Meals from "../components/pages/KitchenAdmin/MealPage/Meal.jsx";
import MealDetailsForm from "../components/pages/KitchenAdmin/AddMealPage/AddMeal.jsx";
import EditMeal from "../components/pages/KitchenAdmin/EditMealPage/EditMeal.jsx";

// ServingStaff
import Serving from "../components/pages/ServingStaff/BarcodeScan/Serving.jsx";
import MealConform from "../components/pages/ServingStaff/MealConfirm/MealConform.jsx";

// KitchenStaff
import KitchenStaff from "../components/pages/KitchenStaff/kitchenStaff.jsx";

// INVENTORY_ADMIN
import AnalysisDashboard from "../components/Pages/InventoryAdmin/AnalysisDashboard/AnalysisDashboard.jsx";
import OrderReportDashboard from "../components/Pages/InventoryAdmin/OrderReportDashboard/OrderReportDashboard.jsx";
import OrderHistory from "../components/Pages/InventoryAdmin/OrderHistory/OrderHistory.jsx";
import CostAnalysis from "../components/organisms/Inventory/Analysis/Cost Analysis/CostAnalysis.jsx";
import LoginRouting from "../guards/LoginRouting.jsx";

//UserAccout
import ProfilePage from "../components/pages/UserAccount/ProfilePage/ProfilePage.jsx";
import UserMeals from "../components/pages/UserAccount/MealsPage/MealsPage.jsx";
import ChangePasswordForm from "../components/pages/ChangePassword/ChangePasswordForm.jsx";

// SuperAdmin
import SuperAdmin from "../components/pages/SuperAdmin/SuperAdmin.jsx";
import SuperAdminLogin from '../components/pages/Login/SuperAdmin/LoginPage/Login.jsx';
import Organizations from '../components/organisms/SuperAdmin/pages/Organizations/Organization List/OrganizationList.jsx';
import Roles from '../components/organisms/SuperAdmin/pages/Roles/RolesList.jsx';
import Permissions from '../components/organisms/SuperAdmin/pages/Permissions/PermissionsList.jsx';

const PrivateRoutes = () => (
  <>
    <Route
      path="/Login"
      element={
        <LoginRouting>
          <Login />
        </LoginRouting>
      }
    />
    <Route
      path="/LoginRole"
      element={
        <ProtectedRoute
          allowedRoles={[
            "HR_ADMIN",
            "INVENTORY_ADMIN",
            "KITCHEN_ADMIN",
            "KITCHEN_STAFF",
          ]}
        >
          <LoginRole />
        </ProtectedRoute>
      }
    />

    {/* SuperAdmin Routes */}
    <Route
      path="/SuperAdmin/login"
      element={<SuperAdminLogin />}
    />
    <Route
      path="/SuperAdmin/dashboard"
      element={
        <SuperAdminProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
          <SuperAdmin />
        </SuperAdminProtectedRoute>
      }
    />
    <Route
      path="/SuperAdmin/organizations"
      element={
        <SuperAdminProtectedRoute allowedRoles={["SUPER_ADMIN"]}> 
          <Organizations />
        </SuperAdminProtectedRoute>
      }
    />
    <Route
      path="/SuperAdmin/roles"
      element={
        <SuperAdminProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
          <Roles />
        </SuperAdminProtectedRoute>
      }
    />
    <Route
      path="/SuperAdmin/permissions"
      element={
        <SuperAdminProtectedRoute allowedRoles={["SUPER_ADMIN"]}> 
          <Permissions />
        </SuperAdminProtectedRoute>
      }
    />
    
    

    {/* HR_ADMIN Routes */}
    <Route
      path="/EmployeePage"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN","KITCHEN_ADMIN"]}>
          <EmployeePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reg"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN","KITCHEN_ADMIN"]}>
          <RegisterPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payroll"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN","KITCHEN_ADMIN"]}>
          <PayrollPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/adjustment"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN","KITCHEN_ADMIN"]}>
          <AdjustmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payslip"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN","KITCHEN_ADMIN"]}>
          <PayslipPage />
        </ProtectedRoute>
      }
    />

    {/* UserPortal Routes */}
    <Route
      path="/ProfilePage"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <ProfilePage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/UserMeals"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <UserMeals />
        </ProtectedRoute>
      }
    />

    <Route
      path="/UserPayroll"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <UserPayrollPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/changePassword"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <ChangePasswordForm />
        </ProtectedRoute>
      }
    />
    

    {/* KITCHEN_ADMIN Routes */}
    <Route
      path="/kitchen-admin"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN","HR_ADMIN"]}>
          <KitchenAdmin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-report"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN","HR_ADMIN"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-meal"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN","HR_ADMIN"]}>
          <Meals />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-details"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN","HR_ADMIN"]}>
          <MealDetailsForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-meal"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN","HR_ADMIN"]}>
          <EditMeal />
        </ProtectedRoute>
      }
    />

    {/* ServingStaff Routes */}
    <Route
      path="/serving"
      element={
        // <ProtectedRoute allowedRoles={["KITCHEN_STAFF"]}>
          <Serving />
        // </ProtectedRoute>
      }
    />
    <Route
      path="/meal-conform/:id"
      element={
        // <ProtectedRoute allowedRoles={["KITCHEN_STAFF"]}>
          <MealConform />
        // </ProtectedRoute>
      }
    />

    {/*Kitchen Staff */}
    <Route
      path="/kitchenStaff"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_STAFF"]}>
          <KitchenStaff />
        </ProtectedRoute>
      }
    />


    <Route
      path="/CostAnalysis"
      element={
        // <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <CostAnalysis />
        // </ProtectedRoute>
      }
    />
    <Route
      path="/AnalysisDashboard"
      element={
        // <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <AnalysisDashboard />
        // </ProtectedRoute>
      }
    />
    <Route
      path="/OrderReportDashboard"
      element={
        // <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <OrderReportDashboard />
        // </ProtectedRoute>
      }
    />
    <Route
      path="/OrderHistory"
      element={
        // <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <OrderHistory />
        // </ProtectedRoute>
      }
    />

    {/* User account */}

    <Route
      path="/UserMeals"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <UserMeals />
        </ProtectedRoute>
      }
    />
  </>
);

export default PrivateRoutes;

import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../../src/guards/ProtectedRoutes";
import SuperAdminProtectedRoute from "../../src/guards/SuperAdminProtectedRoute";
import LoginRole from "../components/Pages/Login/LoginAsPage/LoginRole";
import Login from "../components/pages/Login/LoginPage/Login";

// HR_ADMIN
import EmployeePage from "../components/Pages/HR/EmployeePage/EmployeePage";
import RegisterPage from "../components/Pages/HR/RegisterPage/RegisterPage";
import PayrollPage from "../components/Pages/HR/PayrollPage/PayrollPage";
import AdjustmentPage from "../components/Pages/HR/AdjustmentPage/AdjustmentPage";
import PayslipPage from "../components/Pages/HR/PayslipPage/PayslipPage";

// KITCHEN_ADMIN
import KitchenAdmin from "../components/pages/KitchenAdmin/SchedulePage/KitchenAdmin";
import Reports from "../components/pages/KitchenAdmin/ReportPage/Report";
import Meals from "../components/pages/KitchenAdmin/MealPage/Meal";
import MealDetailsForm from "../components/pages/KitchenAdmin/AddMealPage/AddMeal";
import EditMeal from "../components/pages/KitchenAdmin/EditMealPage/EditMeal";

// ServingStaff
import Serving from "../components/Pages/ServingStaff/BarcodeScan/Serving";
import MealConform from "../components/pages/ServingStaff/MealConfirm/MealConform";

// KitchenStaff
import KitchenStaff from "../components/Pages/kitchenStaff/kitchenStaff";

// INVENTORY_ADMIN
import Ingredients from "../components/Pages/InventoryAdmin/Dashboard/Ingredients";
import AnalysisDashboard from "../components/Pages/InventoryAdmin/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/Pages/InventoryAdmin/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/Pages/InventoryAdmin/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Inventory/Analysis/Cost Analysis/CostAnalysis";
import LoginRouting from "../guards/LoginRouting";

//UserAccout
import ProfilePage from "../components/Pages/UserAccount/ProfilePage/ProfilePage";
import UserMeals from "../components/Pages/UserAccount/MealsPage/MealsPage";

// SuperAdmin
import SuperAdmin from "../components/pages/SuperAdmin/SuperAdmin";
import SuperAdminLogin from '../components/pages/Login/SuperAdmin/LoginPage/Login';
import Organizations from '../components/organisms/SuperAdmin/pages/Organizations/Organization List/OrganizationList';
import Roles from '../components/organisms/SuperAdmin/pages/Roles/RolesList';
import Permissions from '../components/organisms/SuperAdmin/pages/Permissions/PermissionsList';

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

    {/* INVENTORY_ADMIN Routes */}
    <Route
      path="/Ingredients"
      element={
        <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <Ingredients />
        </ProtectedRoute>
      }
    />
    <Route
      path="/CostAnalysis"
      element={
        <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <CostAnalysis />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AnalysisDashboard"
      element={
        <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <AnalysisDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderReportDashboard"
      element={
        <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <OrderReportDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderHistory"
      element={
        <ProtectedRoute allowedRoles={["INVENTORY_ADMIN"]}>
          <OrderHistory />
        </ProtectedRoute>
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

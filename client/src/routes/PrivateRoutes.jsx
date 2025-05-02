import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes/ProtectedRoutes";
import LoginRole from "../components/pages/LoginRole/LoginRole";
import Login from "../components/pages/Login/Login";

// HR_ADMIN
import EmployeePage from "../components/pages/HR/EmployeePage/EmployeePage";
import RegisterPage from "../components/pages/HR/RegisterPage/RegisterPage";
import ReportPage from "../components/pages/HR/ReportPage/ReportPage";
import PayrollPage from "../components/pages/HR/PayrollPage/PayrollPage";
import AdjustmentPage from "../components/pages/HR/AdjustmentPage/AdjustmentPage";
import PayslipPage from "../components/pages/HR/PayslipPage/PayslipPage";
import Attendance from "../components/pages/HR/Attendance/Attendance";
import EmployeeDetails from "../components/pages/HR/Attendance/EmployeeDetails";

// UserPortal
import ProfilePage from "../components/UserPortalUI/Profile/Profile";
import MealsPage from "../components/UserPortalUI/Meals/Meals";
import SuggestionsPage from "../components/UserPortalUI/Suggestions/Suggestions";
import AttendancePage from "../components/UserPortalUI/Attendance/Attendance";
import PayrollDetails from "../components/UserPortalUI/Components/payroll-details";

// KITCHEN_ADMIN
import KitchenAdmin from "../components/pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "../components/pages/Kitchen Admin/Report/report";
import Meals from "../components/pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "../components/pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "../components/pages/Kitchen Admin/Edit Meal/editMeal";

// ServingStaff
import Serving from "../../src/pages/Serving staff/Barcode Scan/Serving";
import MealConform from "../../src/pages/Serving staff/Meal Conform/MealConform";

// INVENTORY_ADMIN
import Ingredients from "../components/pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "../components/pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/pages/Ingredient Manager/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";
import LoginRouting from "../components/ProtectedRoutes/LoginRouting";

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
    {/* HR_ADMIN Routes */}
    <Route
      path="/EmployeePage"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <EmployeePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reg"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <RegisterPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reportPage"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <ReportPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payroll"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <PayrollPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/adjustment"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <AdjustmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payslip"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <PayslipPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/Attendance"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <Attendance />
        </ProtectedRoute>
      }
    />
    <Route
      path="/EmployeeDetails"
      element={
        <ProtectedRoute allowedRoles={["HR_ADMIN"]}>
          <EmployeeDetails />
        </ProtectedRoute>
      }
    />

    {/* UserPortal Routes */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meals"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <MealsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/suggestions"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <SuggestionsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AttendancePage"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <AttendancePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/userpayroll"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <PayrollDetails />
        </ProtectedRoute>
      }
    />

    {/* KITCHEN_ADMIN Routes */}
    <Route
      path="/kitchen-admin"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN"]}>
          <KitchenAdmin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/report"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-meal"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN"]}>
          <Meals />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-details"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN"]}>
          <MealDetailsForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-meal"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_ADMIN"]}>
          <EditMeal />
        </ProtectedRoute>
      }
    />

    {/* ServingStaff Routes */}
    <Route
      path="/serving"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_STAFF"]}>
          <Serving />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-conform/:id"
      element={
        <ProtectedRoute allowedRoles={["KITCHEN_STAFF"]}>
          <MealConform />
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
  </>
);

export default PrivateRoutes;

import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes/ProtectedRoutes";

// HR_Manager
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

// Kitchen_Admin
import KitchenAdmin from "../components/pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "../components/pages/Kitchen Admin/Report/report";
import Meals from "../components/pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "../components/pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "../components/pages/Kitchen Admin/Edit Meal/editMeal";

// ServingStaff
import Serving from "../../src/pages/Serving staff/Barcode Scan/Serving";
import MealConform from "../../src/pages/Serving staff/Meal Conform/MealConform";

// Inventory_Manager
import Ingredients from "../components/pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "../components/pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/pages/Ingredient Manager/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";



const PrivateRoutes = () => (
  <>
    {/* HR_Manager Routes */}
    <Route
      path="/EmployeePage"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <EmployeePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reg"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <RegisterPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reportPage"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <ReportPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payroll"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <PayrollPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/adjustment"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <AdjustmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payslip"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <PayslipPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/Attendance"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <Attendance />
        </ProtectedRoute>
      }
    />
    <Route
      path="/EmployeeDetails"
      element={
        <ProtectedRoute allowedRoles={["HR_Manager"]}>
          <EmployeeDetails />
        </ProtectedRoute>
      }
    />

    {/* UserPortal Routes */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={["UserPortal"]}>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meals"
      element={
        <ProtectedRoute allowedRoles={["UserPortal"]}>
          <MealsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/suggestions"
      element={
        <ProtectedRoute allowedRoles={["UserPortal"]}>
          <SuggestionsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AttendancePage"
      element={
        <ProtectedRoute allowedRoles={["UserPortal"]}>
          <AttendancePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/userpayroll"
      element={
        <ProtectedRoute allowedRoles={["UserPortal"]}>
          <PayrollDetails />
        </ProtectedRoute>
      }
    />

    {/* Kitchen_Admin Routes */}
    <Route
      path="/kitchen-admin"
      element={
        <ProtectedRoute allowedRoles={["Kitchen_Admin"]}>
          <KitchenAdmin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/report"
      element={
        <ProtectedRoute allowedRoles={["Kitchen_Admin"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-meal"
      element={
        <ProtectedRoute allowedRoles={["Kitchen_Admin"]}>
          <Meals />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-details"
      element={
        <ProtectedRoute allowedRoles={["Kitchen_Admin"]}>
          <MealDetailsForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-meal"
      element={
        <ProtectedRoute allowedRoles={["Kitchen_Admin"]}>
          <EditMeal />
        </ProtectedRoute>
      }
    />

    {/* ServingStaff Routes */}
    <Route
      path="/serving"
      element={
        <ProtectedRoute allowedRoles={["ServingStaff"]}>
          <Serving />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-conform/:id"
      element={
        <ProtectedRoute allowedRoles={["ServingStaff"]}>
          <MealConform />
        </ProtectedRoute>
      }
    />

    {/* Inventory_Manager Routes */}
    <Route
      path="/Ingredients"
      element={
        <ProtectedRoute allowedRoles={["Inventory_Manager"]}>
          <Ingredients />
        </ProtectedRoute>
      }
    />
    <Route
      path="/CostAnalysis"
      element={
        <ProtectedRoute allowedRoles={["Inventory_Manager"]}>
          <CostAnalysis />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AnalysisDashboard"
      element={
        <ProtectedRoute allowedRoles={["Inventory_Manager"]}>
          <AnalysisDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderReportDashboard"
      element={
        <ProtectedRoute allowedRoles={["Inventory_Manager"]}>
          <OrderReportDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderHistory"
      element={
        <ProtectedRoute allowedRoles={["Inventory_Manager"]}>
          <OrderHistory />
        </ProtectedRoute>
      }
    />
    
  </>
);

export default PrivateRoutes;
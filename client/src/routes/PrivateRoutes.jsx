import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes/ProtectedRoutes";

// HR Section
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

// KitchenAdmin
import KitchenAdmin from "../components/pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "../components/pages/Kitchen Admin/Report/report";
import Meals from "../components/pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "../components/pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "../components/pages/Kitchen Admin/Edit Meal/editMeal";

// ServingStaff
import Serving from "../../src/pages/Serving staff/Barcode Scan/Serving";
import MealConform from "../../src/pages/Serving staff/Meal Conform/MealConform";

// IngredientManager
import Ingredients from "../components/pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "../components/pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/pages/Ingredient Manager/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";

// OrderTab
import OrderTab from "../pages/OrderTab/OrderTab";

const PrivateRoutes = () => (
  <>
    {/* Employee Routes */}
    <Route
      path="/EmployeePage"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <EmployeePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meals"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <MealsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/suggestions"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <SuggestionsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AttendancePage"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <AttendancePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/userpayroll"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <PayrollDetails />
        </ProtectedRoute>
      }
    />

    {/* HR Routes */}
    <Route
      path="/reg"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <RegisterPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reportPage"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <ReportPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payroll"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <PayrollPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/adjustment"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <AdjustmentPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/payslip"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <PayslipPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/Attendance"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <Attendance />
        </ProtectedRoute>
      }
    />
    <Route
      path="/EmployeeDetails"
      element={
        <ProtectedRoute allowedRoles={["hr"]}>
          <EmployeeDetails />
        </ProtectedRoute>
      }
    />

    {/* Kitchen Admin Routes */}
    <Route
      path="/kitchen-admin"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <KitchenAdmin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/report"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-report"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/kitchen-meal"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <Meals />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-details"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <MealDetailsForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-meal"
      element={
        <ProtectedRoute allowedRoles={["kitchen_admin"]}>
          <EditMeal />
        </ProtectedRoute>
      }
    />

    {/* Serving Staff Routes */}
    <Route
      path="/serving"
      element={
        <ProtectedRoute allowedRoles={["serving_staff"]}>
          <Serving />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meal-conform/:id"
      element={
        <ProtectedRoute allowedRoles={["serving_staff"]}>
          <MealConform />
        </ProtectedRoute>
      }
    />

    {/* Ingredient Manager Routes */}
    <Route
      path="/Ingredients"
      element={
        <ProtectedRoute allowedRoles={["ingredient_manager"]}>
          <Ingredients />
        </ProtectedRoute>
      }
    />
    <Route
      path="/CostAnalysis"
      element={
        <ProtectedRoute allowedRoles={["ingredient_manager"]}>
          <CostAnalysis />
        </ProtectedRoute>
      }
    />
    <Route
      path="/AnalysisDashboard"
      element={
        <ProtectedRoute allowedRoles={["ingredient_manager"]}>
          <AnalysisDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderReportDashboard"
      element={
        <ProtectedRoute allowedRoles={["ingredient_manager"]}>
          <OrderReportDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/OrderHistory"
      element={
        <ProtectedRoute allowedRoles={["ingredient_manager"]}>
          <OrderHistory />
        </ProtectedRoute>
      }
    />

    {/* Order Tab Route */}
    <Route
      path="/OrderTab"
      element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <OrderTab />
        </ProtectedRoute>
      }
    />
  </>
);

export default PrivateRoutes;
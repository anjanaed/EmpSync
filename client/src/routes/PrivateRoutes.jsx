import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes/ProtectedRoutes";
import LoginRole from "../components/Pages/LoginRole/LoginRole";
import Login from "../components/Pages/Login/Login";

// HR_ADMIN
import EmployeePage from "../components/Pages/H/EmployeePage/EmployeePage";
import RegisterPage from "../components/Pages/H/RegisterPage/RegisterPage";
import ReportPage from "../components/Pages/H/ReportPage/ReportPage";
import PayrollPage from "../components/Pages/H/PayrollPage/PayrollPage";
import AdjustmentPage from "../components/Pages/H/AdjustmentPage/AdjustmentPage";
import PayslipPage from "../components/Pages/H/PayslipPage/PayslipPage";

// UserPortal
// import ProfilePage from "../components/UserPortalUI/Profile/Profile";
// import MealsPage from "../components/UserPortalUI/Meals/Meals";
// import SuggestionsPage from "../components/UserPortalUI/Suggestions/Suggestions";
// import PayrollDetails from "../components/UserPortalUI/Components/payroll-details";

// KITCHEN_ADMIN
import KitchenAdmin from "../components/Pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "../components/Pages/Kitchen Admin/Report/report";
import Meals from "../components/Pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "../components/Pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "../components/Pages/Kitchen Admin/Edit Meal/editMeal";

// ServingStaff
import Serving from "../components/Pages/Serving staff/Barcode Scan/Serving";
import MealConform from "../components/Pages/Serving staff/Meal Conform/MealConform";

// KitchenStaff
import KitchenStaff from "../components/Pages/kitchen staff/kitchenStaff";

// INVENTORY_ADMIN
import Ingredients from "../components/Pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "../components/Pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/Pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/Pages/Ingredient Manager/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";
import LoginRouting from "../components/ProtectedRoutes/LoginRouting";

//UserAccout
import ProfilePage from "../components/Pages/UserAccount/ProfilePage/ProfilePage";
import UserMeals from "../components/Pages/UserAccount/MealsPage/MealsPage";

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

    {/* UserPortal Routes */}
    <Route
      path="/profile"
      element={
        <ProtectedRoute allowedRoles={["*"]}>
          <ProfilePage />
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
      path="/kitchen-report"
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

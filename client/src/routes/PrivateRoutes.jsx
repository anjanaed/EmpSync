import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoutes/ProtectedRoutes";
import LoginRole from "../components/pages/LoginRole/LoginRole";
import Login from "../components/pages/Login/Login";

import EmployeePage from "../components/pages/HR/EmployeePage/EmployeePage";
import RegisterPage from "../components/pages/HR/RegisterPage/RegisterPage";
import ReportPage from "../components/pages/HR/ReportPage/ReportPage";
import PayrollPage from "../components/pages/HR/PayrollPage/PayrollPage";
import AdjustmentPage from "../components/pages/HR/AdjustmentPage/AdjustmentPage";
import PayslipPage from "../components/pages/HR/PayslipPage/PayslipPage";
import Attendance from "../components/pages/HR/Attendance/Attendance";
import EmployeeDetails from "../components/pages/HR/Attendance/EmployeeDetails";

import ProfilePage from "../components/UserPortalUI/Profile/Profile";
import MealsPage from "../components/UserPortalUI/Meals/Meals";
import SuggestionsPage from "../components/UserPortalUI/Suggestions/Suggestions";
import AttendancePage from "../components/UserPortalUI/Attendance/Attendance";
import PayrollDetails from "../components/UserPortalUI/Components/payroll-details";

import KitchenAdmin from "../components/pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "../components/pages/Kitchen Admin/Report/report";
import Meals from "../components/pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "../components/pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "../components/pages/Kitchen Admin/Edit Meal/editMeal";

import Serving from "../../src/pages/Serving staff/Barcode Scan/Serving";
import MealConform from "../../src/pages/Serving staff/Meal Conform/MealConform";

import Ingredients from "../components/pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "../components/pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "../components/pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import OrderHistory from "../components/pages/Ingredient Manager/OrderHistory/OrderHistory";
import CostAnalysis from "../components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";
import LoginRouting from "../components/ProtectedRoutes/LoginRouting";

// Helper function for Protected Routes
const createRoute = (path, component, allowedRoles) => (
  <Route
    path={path}
    element={
      <ProtectedRoute allowedRoles={allowedRoles}>
        {component}
      </ProtectedRoute>
    }
  />
);

const PrivateRoutes = () => {
  // Routes Map
  const routeMap = [
    // Login Route (handled by LoginRouting)
    {
      path: "/Login",
      component: <Login />,
      allowedRoles: [],
      isLoginRoute: true, // Special flag to handle differently
    },
    {
      path: "/LoginRole",
      component: <LoginRole />,
      allowedRoles: [
        "HR_ADMIN",
        "INVENTORY_ADMIN",
        "KITCHEN_ADMIN",
        "KITCHEN_STAFF",
      ],
    },
    // HR_ADMIN Routes
    { path: "/EmployeePage", component: <EmployeePage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/reg", component: <RegisterPage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/reportPage", component: <ReportPage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/payroll", component: <PayrollPage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/adjustment", component: <AdjustmentPage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/payslip", component: <PayslipPage />, allowedRoles: ["HR_ADMIN"] },
    { path: "/Attendance", component: <Attendance />, allowedRoles: ["HR_ADMIN"] },
    { path: "/EmployeeDetails", component: <EmployeeDetails />, allowedRoles: ["HR_ADMIN"] },

    // UserPortal Routes
    { path: "/profile", component: <ProfilePage />, allowedRoles: ["*"] },
    { path: "/meals", component: <MealsPage />, allowedRoles: ["*"] },
    { path: "/suggestions", component: <SuggestionsPage />, allowedRoles: ["*"] },
    { path: "/AttendancePage", component: <AttendancePage />, allowedRoles: ["*"] },
    { path: "/userpayroll", component: <PayrollDetails />, allowedRoles: ["*"] },

    // KITCHEN_ADMIN Routes
    { path: "/kitchen-admin", component: <KitchenAdmin />, allowedRoles: ["KITCHEN_ADMIN"] },
    { path: "/report", component: <Reports />, allowedRoles: ["KITCHEN_ADMIN"] },
    { path: "/kitchen-meal", component: <Meals />, allowedRoles: ["KITCHEN_ADMIN"] },
    { path: "/meal-details", component: <MealDetailsForm />, allowedRoles: ["KITCHEN_ADMIN"] },
    { path: "/edit-meal", component: <EditMeal />, allowedRoles: ["KITCHEN_ADMIN"] },

    // ServingStaff Routes
    { path: "/serving", component: <Serving />, allowedRoles: ["ServingStaff"] },
    { path: "/meal-conform/:id", component: <MealConform />, allowedRoles: ["ServingStaff"] },

    // INVENTORY_ADMIN Routes
    { path: "/Ingredients", component: <Ingredients />, allowedRoles: ["INVENTORY_ADMIN"] },
    { path: "/CostAnalysis", component: <CostAnalysis />, allowedRoles: ["INVENTORY_ADMIN"] },
    { path: "/AnalysisDashboard", component: <AnalysisDashboard />, allowedRoles: ["INVENTORY_ADMIN"] },
    { path: "/OrderReportDashboard", component: <OrderReportDashboard />, allowedRoles: ["INVENTORY_ADMIN"] },
    { path: "/OrderHistory", component: <OrderHistory />, allowedRoles: ["INVENTORY_ADMIN"] },
  ];

  return (
    <>
      {/* Routes */}
      {routeMap.map(({ path, component, allowedRoles, isLoginRoute }) => {
        if (isLoginRoute) {
          return (
            <Route
              key={path}
              path={path}
              element={
                <LoginRouting>
                  {component}
                </LoginRouting>
              }
            />
          );
        }

        return createRoute(path, component, allowedRoles);
      })}
    </>
  );
};

export default PrivateRoutes;

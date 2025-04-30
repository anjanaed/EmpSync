import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import "antd/dist/reset.css";
import RootLayout from "./components/UserPortalUI/layout"; // Import RootLayout
import PayrollDetails from "./components/UserPortalUI/Components/payroll-details"; // Import PayrollDetails
import UserPortal from "./pages/UserPortal/UserPortal";
import ProfilePage from "./components/UserPortalUI/Profile/Profile";
import MealsPage from "./components/UserPortalUI/Meals/Meals"; // Import MealsPage
import SuggestionsPage from "./components/UserPortalUI/Suggestions/Suggestions"; // Import SuggestionsPage
import AttendancePage from "./components/UserPortalUI/Attendance/Attendance"; // Import AttendancePage
import KitchenAdmin from "./components/pages/Kitchen Admin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "./components/pages/Kitchen Admin/Report/report";
import Meals from "./components/pages/Kitchen Admin/MealDash/meal";
import MealDetailsForm from "./components/pages/Kitchen Admin/Add Meal/addMeal";
import EditMeal from "./components/pages/Kitchen Admin/Edit Meal/editMeal";
import Login from "../src/components/pages/Login/Login";
import Serving from "./pages/Serving staff/Barcode Scan/Serving";
import MealConform from "./pages/Serving staff/Meal Conform/MealConform";
import LoginRole from "../src/components/pages/LoginRole/LoginRole";
import PasswordReset from "../src/components/pages/PasswordReset/PasswordReset";
import RegisterPage from "./components/pages/HR/RegisterPage/RegisterPage";
import EmployeePage from "./components/pages/HR/EmployeePage/EmployeePage";
import Ingredients from "./components/pages/Ingredient Manager/Dashboard/Ingredients";
import AnalysisDashboard from "./components/pages/Ingredient Manager/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "./components/pages/Ingredient Manager/OrderReportDashboard/OrderReportDashboard";
import CostAnalysis from "./components/organisms/Ingredients/Analysis/Cost Analysis/CostAnalysis";
import OrderHistory from "./components/pages/Ingredient Manager/OrderHistory/OrderHistory";
import ReportPage from "./components/pages/HR/ReportPage/ReportPage";
import PayrollPage from "./components/pages/HR/PayrollPage/PayrollPage";
import AdjustmentPage from "./components/pages/HR/AdjustmentPage/AdjustmentPage";
import OrderTab from "./pages/OrderTab/OrderTab";
import PayslipPage from "./components/pages/HR/PayslipPage/PayslipPage";
import { Toaster } from "sonner";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import Attendance from "./components/pages/HR/Attendance/Attendance";
import EmployeeDetails from "./components/pages/HR/Attendance/EmployeeDetails";
import { UserProvider } from "./contexts/UserContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Toaster richColors />
        <NotificationsProvider>
          <RootLayout>
            <Routes>
              <Route path="/" element={<EmployeePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/meals" element={<MealsPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/AttendancePage" element={<AttendancePage />} />{" "}
              {/* Add route for AttendancePage */}
              <Route path="/login" element={<Login />} />
              <Route path="/LoginRole" element={<LoginRole />} />
              <Route path="/reg" element={<RegisterPage />} />
              <Route path="/kitchen-admin" element={<KitchenAdmin />} />
              <Route path="/report" element={<Reports />} />
              <Route path="/kitchen-report" element={<Reports />} />
              <Route path="/kitchen-meal" element={<Meals />} />
              <Route path="/meal-details" element={<MealDetailsForm />} />
              <Route path="/edit-meal" element={<EditMeal />} />
              <Route path="/serving" element={<Serving />} />
              <Route path="/meal-conform/:id" element={<MealConform />} />
              <Route path="/passwordReset" element={<PasswordReset />} />
              <Route path="/Ingredients" element={<Ingredients />} />
              <Route path="/CostAnalysis" element={<CostAnalysis />} />
              <Route path="/AnalysisDashboard" element={<AnalysisDashboard />} />
              <Route
                path="/OrderReportDashboard"
                element={<OrderReportDashboard />}
              />
              <Route path="/OrderHistory" element={<OrderHistory />} />
              <Route path="/reportPage" element={<ReportPage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/userpayroll" element={<PayrollDetails />} />
              <Route path="/OrderTab" element={<OrderTab />} />
              <Route path="/adjustment" element={<AdjustmentPage />} />
              <Route path="/payslip" element={<PayslipPage />} />
              <Route path="/Attendance" element={<Attendance />} />
              <Route path="/EmployeeDetails" element={<EmployeeDetails />} />
            </Routes>
          </RootLayout>
        </NotificationsProvider>
      </Router>
    </UserProvider>
  );
}

export default App;

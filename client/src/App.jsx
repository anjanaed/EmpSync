import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import RootLayout from "./components/UserPortalUI/layout"; // Import RootLayout
import PayrollDetails from "./components/UserPortalUI/Components/payroll-details"; // Import PayrollDetails
import UserPortal from "./pages/UserPortal/UserPortal";
import ProfilePage from "./components/UserPortalUI/Profile/Profile";
import MealsPage from "./components/UserPortalUI/Meals/Meals"; // Import MealsPage
import SuggestionsPage from "./components/UserPortalUI/Suggestions/Suggestions"; // Import SuggestionsPage
import AttendancePage from "./components/UserPortalUI/Attendance/Attendance"; // Import AttendancePage
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "./pages/KitchenAdmin/Report/report";
import Meals from "./pages/KitchenAdmin/MealDash/meal";
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import MealPlan from "./pages/KitchenAdmin/MealPlan/mealPlan";
import SelectIngredients from "./pages/KitchenAdmin/SelectIngredients/ingredients";
import EditMeal from "./pages/KitchenAdmin/EditMeal/editMeal";
import Login from "./pages/Login/Login";
import Serving from "./pages/Serving staff/Barcode Scan/Serving";
import MealConform from "./pages/Serving staff/Meal Conform/MealConform";
import LoginRole from "./pages/LoginRole/LoginRole";
import PasswordReset from "./pages/PasswordReset/PasswordReset";
import RegisterPage from "./components/pages/HR/RegisterPage/RegisterPage";
import EmployeePage from "./components/pages/HR/EmployeePage/EmployeePage";
import Ingredients from "./pages/Ingredients/Dashboard/Ingredients";
import AnalysisDashboard from "./pages/Ingredients/AnalysisDashboard/AnalysisDashboard";
import OrderReportDashboard from "./pages/Ingredients/OrderReportDashboard/OrderReportDashboard";
import CostAnalysis from "./components/Ingredients/Analysis/Cost Analysis/CostAnalysis";
import OrderHistory from "./pages/Ingredients/OrderHistory/OrderHistory";
import ReportPage from "./components/pages/HR/ReportPage/ReportPage";
import PayrollPage from "./components/pages/HR/PayrollPage/PayrollPage";
import OrderTab from "./pages/OrderTab/OrderTab";

function App() {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<EmployeePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/attendance" element={<AttendancePage />} /> {/* Add route for AttendancePage */}
          <Route path="/login" element={<Login />} />
          <Route path="/LoginRole" element={<LoginRole />} />
          <Route path="/reg" element={<RegisterPage />} />
          <Route path="/kitchen-admin" element={<KitchenAdmin />} />
          <Route path="/report" element={<Reports />} />
          <Route path="/kitchen-report" element={<Reports />} />
          <Route path="/kitchen-meal" element={<Meals />} />
          <Route path="/meal-details" element={<MealDetailsForm />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/select-ingredients" element={<SelectIngredients />} />
          <Route path="/edit-meal" element={<EditMeal />} />
          <Route path="/serving" element={<Serving />} />
          <Route path="/meal-conform/:id" element={<MealConform />} />
          <Route path="/passwordReset" element={<PasswordReset />} />
          <Route path="/Ingredients" element={<Ingredients />} />
          <Route path="/CostAnalysis" element={<CostAnalysis />} />
          <Route path="/AnalysisDashboard" element={<AnalysisDashboard />} />
          <Route path="/OrderReportDashboard" element={<OrderReportDashboard />} />
          <Route path="/OrderHistory" element={<OrderHistory />} />
          <Route path="/reportPage" element={<ReportPage />} />
          <Route path="/payroll" element={<PayrollDetails />} /> {/* Route for PayrollDetails */}
          <Route path="/OrderTab" element={<OrderTab />} />
        </Routes>
      </RootLayout>
    </Router>
  );
}

export default App;



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash";
import Reports from "./pages/KitchenAdmin/Report/report";
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
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
import ReportPage from "./components/pages/HR/ReportPage/ReportPage";
import PayrollPage from "./components/pages/HR/PayrollPage/PayrollPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/LoginRole" element={<LoginRole />} />
        <Route path="/" element={<EmployeePage />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports />} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
        <Route path="/serving" element={<Serving />} />
        <Route path="/meal-conform/:id" element={<MealConform />} />
        <Route path="/passwordReset" element={<PasswordReset />} />
        <Route path="/Ingredients" element={<Ingredients />} />
        <Route path="/AnalysisDashboard" element={<AnalysisDashboard />} />
        <Route path="/OrderReportDashboard" element={<OrderReportDashboard />}/>
        <Route path="/reportPage" element={<ReportPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
      </Routes>
    </Router>
  );
}

export default App;

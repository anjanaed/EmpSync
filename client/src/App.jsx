import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import Login from "./pages/Login/Login";
import LoginRole from "./pages/LoginRole/LoginRole";
import PasswordReset from "./pages/PasswordReset/PasswordReset"; 
import RegisterPage from "./components/pages/HR/RegisterPage/RegisterPage";
import EmployeePage from "./components/pages/HR/EmployeePage/EmployeePage";
import Test from "./components/pages/test";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} />
        <Route path="/LoginRole" element={<LoginRole />} />
        <Route path="/" element={<EmployeePage />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
        <Route path="/passwordReset" element={<PasswordReset />} /> 
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import Login from "./pages/Login/Login";
import LoginRole from "./pages/LoginRole/LoginRole";
import PasswordReset from "./pages/PasswordReset/PasswordReset"; 
import RegisterPage from "./pages/HRManager/RegisterPage/RegisterPage";
import EmployeePage from "./pages/HRManager/EmployeePage/EmployeePage";
import OrderTab from "./pages/OrderTab/OrderTab";
import React from "react";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/LoginRole" element={<LoginRole />} />
        <Route path="/" element={<EmployeePage />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
        <Route path="/order-tab" element={<OrderTab />} />
      </Routes>
    </Router>
  );
}

export default App;

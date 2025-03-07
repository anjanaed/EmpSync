import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Register from "./pages/HRManager/Registration/Registration";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import Login from "./pages/Login/Login";
import Employees from "./pages/HRManager/Employees/Employees";
import LoginRole from "./pages/LoginRole/LoginRole";
import OrderTab from "./pages/OrderTab/OrderTab";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/LoginRole" element={<LoginRole />} />
        <Route path="/" element={<Employees />} />
        <Route path="/reg" element={<Register />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
        <Route path="/order-tab" element={<OrderTab />} />
        
      </Routes>
    </Router>
  );
}
export default App;

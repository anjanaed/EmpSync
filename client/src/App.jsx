import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Register from "./pages/HRManager/Registration/Registration";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import Login from "./pages/Login/Login";
import Employees from "./pages/HRManager/Employees/Employees";
import LoginRole from "./pages/LoginRole/LoginRole";
import NewNavBar from "./components/hrDashboard/NewNavBar/NewNavBar";
import NewEmployee from "./pages/HRManager/NewEmployee/NewEmployee";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/loginn" element={<NewNavBar />} />
        <Route path="/LoginRole" element={<LoginRole />} />
        <Route path="/" element={<NewEmployee />} />
        <Route path="/reg" element={<Register />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
      </Routes>
    </Router>
  );
}
export default App;

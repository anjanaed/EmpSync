import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Register from "./pages/HRManager/Registration/Registration";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 
import MealDetailsForm from "./pages/KitchenAdmin/MealDetails/MealDetailsForm";
import MealPlan from "./pages/KitchenAdmin/MealPlan/mealPlan";
import SelectIngredients from "./pages/KitchenAdmin/SelectIngredients/ingredients";
import EditMeal from "./pages/KitchenAdmin/EditMeal/editMeal";
import Login from "./pages/Login/Login";
import Employees from "./pages/HRManager/Employees/Employees";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Employees />} />
        <Route path="/reg" element={<Register />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
        <Route path="/meal-details" element={<MealDetailsForm />} />
        <Route path="/meal-plan" element={<MealPlan/>} />
        <Route path="/select-ingredients" element={<SelectIngredients/>} />
        <Route path="/edit-meal" element={<EditMeal/>} />




      </Routes>
    </Router>
  );
}
export default App;

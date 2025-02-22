import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Register from "./pages/registration/Registration";
import KitchenAdmin from "./pages/KitchenAdmin/KitchenAdminDashBoard/kitchenAdminDash"; 
import Reports from "./pages/KitchenAdmin/Report/report"; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/kitchen-admin" element={<KitchenAdmin />} />
        <Route path="/report" element={<Reports/>} />
      </Routes>
    </Router>
  );
}

export default App;

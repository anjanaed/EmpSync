import React from "react";
import './styles/variables.css';
import AppRoutes from "./routes/AppRoutes";
import { DarkModeProvider } from "./contexts/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <AppRoutes />
    </DarkModeProvider>
  );
}

export default App;
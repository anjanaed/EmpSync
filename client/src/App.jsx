import React from "react";
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
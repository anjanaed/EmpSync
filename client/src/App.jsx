import React from "react";
import { ConfigProvider } from "antd";
import './styles/variables.css';
import AppRoutes from "./routes/AppRoutes";
import { DarkModeProvider } from "./contexts/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#c5c5c5",
            fontFamily: 'var(--table-font-family)',
          },
        }}
      >
        <div style={{ background: "var(--secondary-color)", minHeight: "100vh", transition: "background 0.3s" }}>
          <AppRoutes />
        </div>
      </ConfigProvider>
    </DarkModeProvider>
  );
}

export default App;
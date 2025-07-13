import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import "./index.css";
import "./styles/variables.css";
import "./styles/themes.css";
import "antd/dist/reset.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { PopupProvider } from "./contexts/PopupContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_URL}
      clientId={import.meta.env.VITE_AUTH0_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <PopupProvider>
            <App />
          </PopupProvider>
        </ThemeProvider>
      </AuthProvider>
    </Auth0Provider>
  </React.StrictMode>
);

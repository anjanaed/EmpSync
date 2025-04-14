import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
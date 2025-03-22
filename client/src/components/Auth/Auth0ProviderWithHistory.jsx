// components/Auth/Auth0ProviderWithHistory.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  
  // For Vite, use VITE_ prefix instead of REACT_APP_
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Add some console logs to debug
  console.log("Auth0 Domain:", domain);
  console.log("Auth0 Client ID:", clientId);
  console.log("Auth0 Audience:", audience);

  if (!domain || !clientId) {
    console.error("Missing Auth0 configuration. Check your environment variables.");
    // Return some fallback UI instead of breaking
    return <div>Auth0 configuration error. Check console for details.</div>;
  }

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "read:current_user update:current_user_metadata"
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
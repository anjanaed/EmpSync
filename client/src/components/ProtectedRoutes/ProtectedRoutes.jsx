import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData } = useAuth();
  const isAuthenticated = !!authData?.accessToken;
  console.log("User is authenticated......");

  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    console.log("User is not authenticated. Redirecting to /login.");
    return <Navigate to="/" replace />;
  }

  const userRole = authData?.role;
  const hasRequiredRole = allowedRoles.includes(userRole);

  // Redirect unauthorized users to the Unauthorized page
  if (!hasRequiredRole) {
    console.log(`User role (${userRole}) does not have access. Redirecting to /unauthorized.`);
    return <Navigate to="/" replace />;
  }

  // Render the protected component if all checks pass
  return children;
};

export default ProtectedRoute;
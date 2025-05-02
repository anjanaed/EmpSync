import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../atoms/loading/loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData, authLoading } = useAuth();

  if (authLoading) {
    return <Loading />;
  }

  const token = authData.accessToken;

  // Redirect unauthenticated users to the login page
  if (!token) {
    console.log("User is not authenticated. Redirecting to Login.");
    return <Navigate to="/login" replace />;
  }

  const userRole = authData.user.role;

  const hasRequiredRole = allowedRoles.includes("*") || allowedRoles.includes(userRole);


  // Redirect unauthorized users to the Unauthorized page
  if (!hasRequiredRole) {
    console.log(
      children
    );
    return <Navigate to="/login" replace />;
  }

  // Render the protected component if all checks pass
  return children;
};

export default ProtectedRoute;

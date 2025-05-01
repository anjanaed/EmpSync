
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData } = useAuth();
  const isAuthenticated = !!authData?.accessToken;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userRole = authData?.role;
  const hasRequiredRole = allowedRoles.includes(userRole);

  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
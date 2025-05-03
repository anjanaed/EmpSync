import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../atoms/loading/loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData, authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return <Loading />;
  }

  const token = authData?.accessToken;

  // Redirect unauthenticated users to the login page
  if (!token) {
    console.log("User is not authenticated. Redirecting to Login.");
    navigate("/login");
    return null;
  }

  const userRole = authData.user.role;

  const hasRequiredRole =
    allowedRoles.includes("*") || allowedRoles.includes(userRole);

  // Redirect unauthorized users to the Unauthorized page
  if (!hasRequiredRole) {
    navigate("/login");
    return null;
  }

  // Render the protected component if all checks pass
  return children;
};

export default ProtectedRoute;

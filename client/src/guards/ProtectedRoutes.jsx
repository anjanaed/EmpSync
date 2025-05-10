import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/atoms/loading/loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { authData, authLoading } = useAuth();
  const navigate = useNavigate();

  const token = authData?.accessToken;
  const userRole = authData?.user?.role;
  const hasRequiredRole =
    allowedRoles.includes("*") || allowedRoles.includes(userRole);

  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/login");
    }
  }, [authLoading, token, navigate]);

  useEffect(() => {
    if (!authLoading && token && !hasRequiredRole) {
      navigate("/loginrole");
    }
  }, [authLoading, token, hasRequiredRole, navigate]);

  if (authLoading) return <Loading />;

  if (!token || !hasRequiredRole) return null;

  return children;
};

export default ProtectedRoute;

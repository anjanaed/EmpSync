import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Loading from "../components/atoms/loading/loading";

const SuperAdminProtectedRoute = ({ children }) => {
  const { superAuthData, authLoading } = useAuth();
  const navigate = useNavigate();

  const token = superAuthData?.accessToken;
  const role = superAuthData?.role;

  useEffect(() => {
    if (!authLoading && (!token || role !== "SUPER_ADMIN")) {
      navigate("/superadmin/login");
    }
  }, [authLoading, token, role, navigate]);

  if (authLoading) return <Loading />;

  if (!token || role !== "SUPER_ADMIN") return null;

  return children;
};

export default SuperAdminProtectedRoute;

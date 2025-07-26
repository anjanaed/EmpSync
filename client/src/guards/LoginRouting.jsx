import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Loading from "../components/atoms/loading/loading.jsx";

const redirectRoles = [
  "KITCHEN_ADMIN",
  "KITCHEN_STAFF",
  "HR_ADMIN",
];

const LoginRouting = ({ children }) => {
  const { authData, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && authData?.accessToken) {
      const userRole = authData.user.role;

      if (redirectRoles.includes(userRole)) {
        navigate("/loginrole");
      } else {
        navigate("/ProfilePage");
      }
    }
  }, [authData, authLoading, navigate]);

  if (authLoading) return <Loading />;

  return children;
};

export default LoginRouting;

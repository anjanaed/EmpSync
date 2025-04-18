import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to profile page by default
    navigate("/profile");
  }, [navigate]);

  return null;
}
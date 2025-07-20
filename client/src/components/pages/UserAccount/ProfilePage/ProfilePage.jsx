import React from "react";
import UserProfile from "../../../organisms/UserPortal/Userprofile/Userprofile.jsx";
import NavBar from "../../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav.jsx";
import { useAuth } from "../../../../contexts/AuthContext.jsx";

const ProfilePage = () => {
  const { authData } = useAuth();

  if (!authData || !authData.user) {
    return <div>Loading...</div>; // Handle loading or unauthenticated state
  }

  return (
    <>
      <NavBar />
      <UserProfile user={authData.user} />
    </>
  );
};

export default ProfilePage;
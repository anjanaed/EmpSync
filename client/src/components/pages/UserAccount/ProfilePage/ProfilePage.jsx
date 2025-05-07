import React from "react";
import UserProfile from "../../../organisms/UserPortal/Userprofile/Userprofile";
import NavBar from "../../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav";

const ProfilePage = () => {
  const user = {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, Springfield",
    profilePicture: "/path-to-profile-picture.jpg", // Optional
  };

  return (
    <>
      <NavBar />
      <UserProfile user={user} />
    </>
  );
};

export default ProfilePage;
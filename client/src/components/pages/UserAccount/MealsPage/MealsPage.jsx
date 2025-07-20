import React from "react";
import NavBar from "../../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav.jsx";
import Cart from "../../../organisms/UserPortal/Meals/Meals.jsx"; // Import Cart component

const MealsPage = () => {
  return (
    <>
      <NavBar />
      <Cart/>
    </>
  );
};

export default MealsPage;
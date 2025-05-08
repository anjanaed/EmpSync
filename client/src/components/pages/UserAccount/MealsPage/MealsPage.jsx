import React from "react";
import NavBar from "../../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav";
import Cart from "../../../organisms/UserPortal/Meals/Meals"; // Import Cart component

const MealsPage = () => {
  return (
    <>
      <NavBar />
      <Cart/>
    </>
  );
};

export default MealsPage;
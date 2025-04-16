import React from "react";
import Navbar from "../../../components/KitchenAdmin/KitchenNavbar/navbar";
import MealSection from "../../../components/KitchenAdmin/Meals/meals";



const MealDash = () => {
  return (
      <div>
        <Navbar Comp={MealSection} /> 
        {/* <MealSection/> */}
 
      </div>
       
  );
};

export default MealDash;

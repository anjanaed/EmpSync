import React from "react";
import NavBar from "../../../organisms/UserPortal/ResponsiveNavbar/ResponsiveNav";
import Cart from "../../../organisms/UserPortal/Meals/Meals"; // Import Cart component

const MealsPage = () => {
  return (
    <>
      <NavBar />
      <div>hello</div>
      <Cart
        items={[
          { id: 1, name: "Sneakers", price: 59.99, quantity: 2 },
          { id: 2, name: "Boots", price: 89.99, quantity: 1 },
        ]}
        onRemove={(id) => console.log("Remove item with id:", id)}
        onCheckout={() => console.log("Proceed to checkout")}
      />
    </>
  );
};

export default MealsPage;
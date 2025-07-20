import React from 'react';
import {
  faBox,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dashbord from "../../organisms/KitchenStaff/Kitchenstaff.jsx";
import NavBar from '../../organisms/NavBar/NavBar.jsx';

const Serving = () => {
  return (
    <>
      <NavBar
        titleLines={["Kitchen Staff"]}
        menuItems={[
          {
            key: "1",
            icon: <FontAwesomeIcon icon={faBox} />,
            label: "Oder Section",
            link: "/KitchenStaff",
          },
        ]}
        Comp={Dashbord}
      />
    </>
  );
};

export default Serving;
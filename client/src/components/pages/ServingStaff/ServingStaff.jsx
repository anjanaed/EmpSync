import React from 'react';
import {
  faBox,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Dashbord from "../../../components/organisms/Serving/Dashbord";
import NavBar from '../../../components/organisms/NavBar/NavBar';

const Serving = () => {
  return (
    <NavBar
      titleLines={["Meals Serving Admin"]}
      menuItems={[
        {
          key: "1",
          icon: <FontAwesomeIcon icon={faBox} />,
          label: "Oder Section",
          link: "/MealsServing",
        },
        {
          key: "2",
          icon: <FontAwesomeIcon icon={faBell} />,
          label: "Notification",
          link: "/reg",
        },
      ]}
      Comp={Dashbord}
    />
  );
};

export default Serving;
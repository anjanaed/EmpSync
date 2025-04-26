import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChartLine,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import NavBar from "../../../organisms/NavBar/NavBar";

import MealSection from "../../../organisms/Kitchen/Meals/meals";

const MealDash = () => {
  return (
    <NavBar
      titleLines={["Meal", "Schedule", "Management"]}
      menuItems={[
        {
          key: "1",
          icon: <FontAwesomeIcon icon={faCalendar} />,
          label: "Schedule",
          link: "/kitchen-admin",
        },
        {
          key: "2",
          icon: <FontAwesomeIcon icon={faBowlFood} />,
          label: "Meal",
          link: "/kitchen-meal",
        },
        {
          key: "3",
          icon: <FontAwesomeIcon icon={faChartLine} />,
          label: "Report & Analysis",
          link: "/kitchen-report",
        },
      ]}
      Comp={MealSection}
    />
  );
};

export default MealDash;

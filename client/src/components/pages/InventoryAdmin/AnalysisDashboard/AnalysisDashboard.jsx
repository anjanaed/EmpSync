import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileInvoice,
    faBoxes,
    faChartLine,
    faHistory,
} from "@fortawesome/free-solid-svg-icons";
import NavBar from '../../../organisms/NavBar/NavBar';
import Analysis from "../../../organisms/Ingredients/Analysis/Analysis";

const AnalysisDashboard = () => {
    return (
        <NavBar
            titleLines={["Inventory", "Management"]}
            menuItems={[
                {
                    key: "1",
                    icon: <FontAwesomeIcon icon={faBoxes} />,
                    label: "Inventory Management",
                    link: "/Ingredients"
                },
                {
                    key: "2",
                    icon: <FontAwesomeIcon icon={faChartLine} />,
                    label: "Analysis",
                    link: "/AnalysisDashboard"
                },
                {
                    key: "3",
                    icon: <FontAwesomeIcon icon={faFileInvoice} />,
                    label: "Ingredient Selection",
                    link: "/OrderReportDashboard"
                },
                {
                    key: "4",
                    icon: <FontAwesomeIcon icon={faHistory} />,
                    label: "Orders History",
                    link: "/OrderHistory"
                }
            ]}
            Comp={Analysis}
        />
    );
};

export default AnalysisDashboard;
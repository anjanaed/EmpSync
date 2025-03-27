import React from "react";
import Navbar from '../../../components/Ingredients/Navbar/Navbar';
import Order from "../../../components/Ingredients/Order/Order";

const OrderReportDashboard = () => { 
    return (
        <>
            <Navbar Comp={Order}/>
            <h1>Order Report</h1>
        </>
    );
};

export default OrderReportDashboard;
import React from "react";
import Navbar from '../../../components/Ingredients/Navbar/Navbar';
import Orders from '../../../components/Ingredients/OrderHistory/Orders';

const OrderHistory = () => {
    return (
        <>
            <Navbar Comp={Orders}/>
        </>
    );
};

export default OrderHistory;
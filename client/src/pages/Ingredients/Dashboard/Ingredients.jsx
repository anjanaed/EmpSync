import React from 'react';
import Navbar from '../../../components/Ingredients/Navbar/Navbar';
import InventoryManagement from '../../../components/Ingredients/InventoryManagement/InventoryManagement';

const Ingredients = () => {
    return (
        <div>
            <Navbar Comp={InventoryManagement}/>
        </div>
    );
};

export default Ingredients;

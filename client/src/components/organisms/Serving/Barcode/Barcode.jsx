import React from 'react';
import './Barcode.css';

const Barcode = () => {
  // Simple barcode representation
  return (
    <div className="barcode">
      {Array(50).fill(0).map((_, index) => (
        <div 
          key={index} 
          className="barcode-line" 
          style={{ width: index % 3 === 0 ? '3px' : '2px' }}
        />
      ))}
    </div>
  );
};

export default Barcode;
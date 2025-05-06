import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';

const SuggestionsWindow = ({ username, userId }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

 

  return (
    <div>
      <h1>Personalized Suggestions</h1>
      <p>
        <strong>Welcome, {username || 'Guest'}!</strong>
      </p>
      <p>
        <strong>User ID:</strong> {userId || 'Not Available'}
      </p>

    </div>
  );
};

export default SuggestionsWindow;
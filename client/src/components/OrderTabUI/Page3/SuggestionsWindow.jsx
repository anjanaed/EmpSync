import React, { useEffect, useState } from "react";

const SuggestionsWindow = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null); // State to track errors

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);

        // Log the response for debugging
        console.log("API Response:", response);

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text(); // Read the response as text
          console.error("Non-JSON Response:", text); // Log the non-JSON response
          throw new Error("Response is not JSON");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>User Details</h1>
      <p><strong>Name:</strong> {userData.name}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Role:</strong> {userData.role}</p>
    </div>
  );
};

export default SuggestionsWindow;
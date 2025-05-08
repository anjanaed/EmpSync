import React, { useEffect, useState } from 'react';
import { Typography, Card } from 'antd';
import styles from './DateAndTime.module.css';

// DateAndTime component to display the current date and time
const DateAndTime = () => {
    // State to store and update the current date and time
    const [currentDateTime, setCurrentDateTime] = useState(() => {
        const now = new Date();
        // Options for formatting the date (e.g., "Monday, Jan 1, 2025")
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        // Options for formatting the time (e.g., "12:00:00 PM")
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const date = now.toLocaleDateString('en-US', options);
        const time = now.toLocaleTimeString('en-US', timeOptions);
        return `${date} | ${time}`; // Initial date and time string
    });

    // Effect to update date and time every second
    useEffect(() => {
        // Set up interval to update time every 1000ms (1 second)
        const intervalId = setInterval(() => {
            const now = new Date();
            // Format date with weekday, month, day, and year
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            // Format time with hours, minutes, seconds, and AM/PM
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            const date = now.toLocaleDateString('en-US', options);
            const time = now.toLocaleTimeString('en-US', timeOptions);
            setCurrentDateTime(`${date} | ${time}`); // Update state with new date and time
        }, 1000);
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures effect runs only once on mount

    // Render the date and time in a styled Typography component
    return (
        <div>
            <Typography.Title level={2} className={styles.getGreeting}>
                {currentDateTime}
            </Typography.Title>
        </div>
    );
};

// Export the DateAndTime component
export default DateAndTime;
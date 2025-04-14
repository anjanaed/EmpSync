import React, { useState, useEffect } from 'react';
import styles from './DateAndTime.module.css';

const DateAndTime = () => {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const optionsDate = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
            const optionsTime = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            const formattedDate = now.toLocaleDateString('en-US', optionsDate);
            const formattedTime = now.toLocaleTimeString('en-US', optionsTime);
            setCurrentDateTime(`${formattedDate} | ${formattedTime}`);
        };

        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    return (
        <div className={styles.dateTimeContainer}>
            {currentDateTime}
        </div>
    );
};

export default DateAndTime;
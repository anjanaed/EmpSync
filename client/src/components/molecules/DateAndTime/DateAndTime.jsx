import React, { useEffect, useState } from 'react';
import { Typography, Card } from 'antd';
import styles from './DateAndTime.module.css';

const DateAndTime = () => {
   
    const [currentDateTime, setCurrentDateTime] = useState(() => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const date = now.toLocaleDateString('en-US', options);
        const time = now.toLocaleTimeString('en-US', timeOptions);
        return `${date} | ${time}`;
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
            const date = now.toLocaleDateString('en-US', options);
            const time = now.toLocaleTimeString('en-US', timeOptions);
            setCurrentDateTime(`${date} | ${time}`);
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return(
        <div>
            <Typography.Title level={2} className={styles.getGreeting}>{currentDateTime}</Typography.Title>
        </div>
    )
};

export default DateAndTime;
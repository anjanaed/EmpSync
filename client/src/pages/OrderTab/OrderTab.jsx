// filepath: c:\Users\hasha\Documents\GitHub\EmpSync\client\src\pages\OrderTab\OrderTab.jsx
import React, { useEffect, useState } from 'react';
import { Carousel, Typography, Button, Card, Flex } from 'antd';
import styles from './OrderTab.module.css';

const OrderTab = () => {

    const carouselRef = React.useRef();

    const next = () => {
        carouselRef.current.next();
    };

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return  "Good Morning සුභ උදෑසනක් වේවා காலை வணக்கம்";
        } else if (currentHour < 17) {
            return "Good Afternoon සුභ දහවලක් වේවා மதிய வணக்கம்";
        } else {
            return "Good Evening සුභ සන්ධ්‍යාවක් වේවා மலை வணக்கம்";
        }
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
        const date = now.toLocaleDateString('en-US', options);
        const time = now.toLocaleTimeString('en-US', timeOptions);
        return `${date} | ${time}`;
    };

    const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div>
                    <div className={styles.contentStyle1}>
                        <br />
                        <div><Typography.Title level={2} className={styles.getGreeting}>{getGreeting() }</Typography.Title></div>
                        <div><Typography.Title level={1} className={styles.mainTitle}>Welcome to Helix Food Ordering</Typography.Title></div>
                        <div><Typography.Title level={2} className={styles.getGreeting}>{currentDateTime}</Typography.Title></div>
                        <div>
                        <Card className={styles.cardStyle}>
                            <Flex justify="center" align="center" direction="column">
                                <div className={styles.cardPart1}>
                                <Typography.Title level={2} className={styles.getGreeting}>
                                    <div className={styles.cardPart}>
                                        
                                        Place Your Finger on Fingerprint Scanner
                                    </div>
                                    <div>
                                        <br />
                                    <Card className={styles.cardStyle}>
                                    <i className={`material-icons ${styles.fingerprintIcon}`}>fingerprint</i>
                                    </Card>
                                    </div>
                                </Typography.Title>
                                <div>
                                    
                                </div>
                                </div>
                                <div className={styles.cardPart2}>
                                    <Typography.Title level={2} className={styles.getGreeting}>Select your language | භාෂාව තෝරන්න | <br />மொழியை தேர்ந்தெடுக்கவும்</Typography.Title>
                                    <button className={styles.languageButton} onClick={() => console.log('English selected')}>English Language</button><br />
                                    <button className={styles.languageButton} onClick={() => console.log('Sinhala selected')}>සිංහල භාෂාව</button><br />
                                    <button className={styles.languageButton} onClick={() => console.log('Tamil selected')}>தமிழ் மொழி</button><br />
                                </div>
                            </Flex>
                        </Card>
                        </div>
                        <button onClick={next}>Move 1 to 2</button>
                    </div>
                </div>
                <div>
                    <div className={styles.contentStyle2}>
                        
                        <button onClick={next}>Move 2 to 3</button>
                    </div>
                </div>
                <div>
                    <div className={styles.contentStyle3}>
                        <button onClick={next}>Move 3 to 4</button>
                    </div>
                </div>
                <div>
                    <div className={styles.contentStyle}>
                        <button onClick={next}>Move 4 to 1</button>
                    </div>
                </div>
            </Carousel>
        </>
    );
};
export default OrderTab;
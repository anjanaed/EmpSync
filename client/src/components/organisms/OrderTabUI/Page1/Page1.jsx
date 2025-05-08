import React from 'react';
import { Typography, Card } from 'antd';
import styles from './Page1.module.css'; 
import DateAndTime from '../DateAndTime/DateAndTime';


const Page1 = ({ carouselRef, setLanguage }) => { // Accept setLanguage as a prop
    const handleLanguageSelect = (language) => {
        console.log(`${language} selected`);
        setLanguage(language.toLowerCase()); // Update the language state in OrderTab
        if (carouselRef && carouselRef.current) {
            carouselRef.current.next(); // Move to the next slide
        }
    };

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return "Good Morning සුභ උදෑසනක් වේවා காலை வணக்கம்";
        } else if (currentHour < 17) {
            return "Good Afternoon සුභ දහවලක් වේවා மதிய வணக்கம்";
        } else {
            return "Good Evening සුභ සන්ධ්‍යාවක් වේවා மலை வணக்கம்";
        }
    };

    return (
        <div className={styles.mainbox}>
            <div>
                <br />
                <Typography.Title level={2} className={styles.getGreeting}>{getGreeting()}</Typography.Title>
            </div>
            <div>
                <Typography.Title level={1} className={styles.mainTitle1}>Welcome to Helix Food Ordering</Typography.Title>
            </div>
            <div>
                <DateAndTime />
            </div>
            <br />
            <div>
                <Card className={styles.cardStyle}>
                    <div className={styles.cardPartl}>
                        <Typography.Title level={2} className={styles.getGreeting}>
                            Select your language | භාෂාව තෝරන්න | மொழியை தேர்ந்தெடுக்கவும்
                        </Typography.Title>
                        <br /><br />
                        <div className={styles.languageButtonContainer}>
                            <button className={styles.languageButton} onClick={() => handleLanguageSelect('English')}>English</button>
                            <button className={styles.languageButton} onClick={() => handleLanguageSelect('Sinhala')}>සිංහල</button>
                            <button className={styles.languageButton} onClick={() => handleLanguageSelect('Tamil')}>தமிழ்</button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Page1;
// filepath: c:\Users\hasha\Documents\GitHub\EmpSync\client\src\pages\OrderTab\OrderTab.jsx
import React, { useEffect, useState } from 'react';
import { Carousel, Typography, Button, Card, Flex } from 'antd';
import styles from './OrderTab.module.css';

const OrderTab = () => {

    const carouselRef = React.useRef();
    const innerCarouselRef = React.useRef();
    const [animate, setAnimate] = useState(false);
    const [fingerprintColor, setFingerprintColor] = useState('red');
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const next = () => {
        carouselRef.current.next();
    };

    const nextInner = () => {
        innerCarouselRef.current.next();
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

    const getTodayDate = () => {
        const now = new Date();
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        return now.toLocaleDateString('en-US', options);
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        return tomorrow.toLocaleDateString('en-US', options);
    };

    const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        // Auto-select the "Today" button when the component mounts
        nextInner();
    }, []);

    const handleLanguageSelect = (language) => {
        console.log(`${language} selected`);
        setSelectedLanguage(language);
        setFingerprintColor('green');
    };

    const getTitleText = () => {
        switch (selectedLanguage) {
            case 'Sinhala':
                return ' දිනය සහ ආහාර වේල තෝරන්න';
            case 'Tamil':
                return 'தேதி மற்றும் உணவை தேர்ந்தெடுக்கவும்';
            default:
                return 'Select Date and Meal Time';
        }
    };

    const getButtonText = (key) => {
        const texts = {
            English: {
                today: 'Today',
                tomorrow: 'Tomorrow',
                breakfast: 'Breakfast',
                lunch: 'Lunch',
                dinner: 'Dinner',
            },
            Sinhala: {
                today: 'අද',
                tomorrow: 'හෙට',
                breakfast: 'උදේ ආහාරය',
                lunch: 'දවල් ආහාරය',
                dinner: 'රාත්‍රී ආහාරය',
            },
            Tamil: {
                today: 'இன்று',
                tomorrow: 'நாளை',
                breakfast: 'காலை உணவு',
                lunch: 'மதிய உணவு',
                dinner: 'இரவு உணவு',
            },
        };
        return texts[selectedLanguage][key];
    };

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div>
                    <div className={styles.contentStyle1}>
                        <br />
                        <div><Typography.Title level={2} className={styles.getGreeting}>{getGreeting() }</Typography.Title></div>
                        <div><Typography.Title level={1} className={styles.mainTitle1}>Welcome to Helix Food Ordering</Typography.Title></div>
                        <div><Typography.Title level={2} className={styles.getGreeting}>{currentDateTime}</Typography.Title></div>
                        <br />
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
                                    <i className={`material-icons ${styles.fingerprintIcon} ${animate ? 'animate' : ''}`} style={{ color: fingerprintColor }}>fingerprint</i>
                                    </Card>
                                    </div>
                                </Typography.Title>
                                
                                </div>
                                <div className={styles.cardPart2}>
                                    <Typography.Title level={2} className={styles.getGreeting}>Select your language | භාෂාව තෝරන්න | <br />மொழியை தேர்ந்தெடுக்கவும்</Typography.Title>
                                    <button className={styles.languageButton} onClick={() => { handleLanguageSelect('English'); next(); }} >English Language</button><br />
                                    <button className={styles.languageButton} onClick={() => { handleLanguageSelect('Sinhala'); next(); }}>සිංහල භාෂාව</button><br />
                                    <button className={styles.languageButton} onClick={() => { handleLanguageSelect('Tamil'); next(); }}>தமிழ் மொழி</button><br />
                                </div>
                                
                            </Flex>
                            <div><Typography.Title level={4} className={styles.getGreeting}>Secure & Quick Access — Scan your fingerprint to continue
                            ordering your favorite meals!</Typography.Title></div>
                        </Card>
                        </div>
                        
                    </div>
                </div>
                <div>
                    <div className={styles.contentStyle2}>
                        <br />
                        <div className={styles.headerContainer}>
                            <div className={styles.currentTime}>{currentDateTime}</div>
                            <div className={styles.userName}>John Wick</div>
                        </div>
                        <br />
                        <Card className={styles.cardStyle2}>
                            <div><Typography.Title level={1} className={styles.mainTitle2}>{getTitleText()}</Typography.Title></div>
                            <Carousel ref={innerCarouselRef} afterChange={(currentSlide) => console.log(currentSlide)}>
                                <div className={styles.carouselItem}>
                                    <button className={styles.carouselItemHeadButton} style={{ backgroundColor: 'rgb(99, 5, 5)', color: 'white' }}>
                                        {getButtonText('today')} ✅ <br />({getTodayDate()})
                                    </button>
                                    <button className={styles.carouselItemHeadButton} onClick={nextInner}>
                                        {getButtonText('tomorrow')}<br /> ({getTomorrowDate()})
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle breakfast selection */ }}>
                                        {getButtonText('breakfast')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle lunch selection */ }}>
                                        {getButtonText('lunch')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle dinner selection */ }}>
                                        {getButtonText('dinner')}
                                    </button><br />
                                </div>
                                <div className={styles.carouselItem}>
                                    <button className={styles.carouselItemHeadButton} onClick={nextInner}>
                                        {getButtonText('today')} <br />({getTodayDate()})
                                    </button>
                                    <button className={styles.carouselItemHeadButton} style={{ backgroundColor: 'rgb(99, 5, 5)', color: 'white' }}>
                                        {getButtonText('tomorrow')} ✅ <br /> ({getTomorrowDate()})
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle breakfast selection */ }}>
                                        {getButtonText('breakfast')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle lunch selection */ }}>
                                        {getButtonText('lunch')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { /* handle dinner selection */ }}>
                                        {getButtonText('dinner')}
                                    </button><br />
                                </div>
                            </Carousel>
                            <button className={styles.prevButton} onClick={() => carouselRef.current.prev()}>&lt;</button>
                        </Card>
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
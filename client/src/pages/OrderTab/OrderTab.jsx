import React, { useEffect, useState } from 'react';
import { Carousel, Typography, Button, Card, Flex, Avatar, List, Radio, Space } from 'antd';
import styles from './OrderTab.module.css';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Divider, Skeleton } from 'antd';

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
];

const positionOptions = ['top', 'bottom', 'both'];
const alignOptions = ['start', 'center', 'end'];

const OrderTab = () => {

    const carouselRef = React.useRef();
    const innerCarouselRef = React.useRef();
    const [animate, setAnimate] = useState(false);
    const [fingerprintColor, setFingerprintColor] = useState('red');
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [selectedDate, setSelectedDate] = useState('today');
    const [selectedMeal, setSelectedMeal] = useState('breakfast');
    const [position, setPosition] = useState('bottom');
    const [align, setAlign] = useState('center');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const next = () => {
        carouselRef.current.next();
    };

    const nextInner = () => {
        innerCarouselRef.current.next();
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
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return now.toLocaleDateString('en-US', options);
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
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

    const getTitleText2 = () => {
        switch (selectedLanguage) {
            case 'Sinhala':
                return ' ඇණවුම් කරන්න';
            case 'Tamil':
                return 'ஆர்டர் செய்யவும்';
            default:
                return 'Place Order';
        }
    };

    const getOrderText = () => {
        const texts = {
            today: {
                breakfast: {
                    English: "Order for today's breakfast",
                    Sinhala: "අද දින උදෑසන ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "இன்றைய காலை உணவுக்கு ஆர்டர் செய்யவும்"
                },
                lunch: {
                    English: "Order for today's lunch",
                    Sinhala: "අද දින දිවා ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "இன்றைய மதிய உணவுக்கு ஆர்டர் செய்யவும்"
                },
                dinner: {
                    English: "Order for today's dinner",
                    Sinhala: "අද දින රාත්‍රී ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "இன்றைய இரவு உணவுக்கு ஆர்டர் செய்யவும்"
                }
            },
            tomorrow: {
                breakfast: {
                    English: "Order for tomorrow's breakfast",
                    Sinhala: "හෙට දින උදෑසන ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "நாளைய காலை உணவுக்கு ஆர்டர் செய்யவும்"
                },
                lunch: {
                    English: "Order for tomorrow's lunch",
                    Sinhala: "හෙට දින දිවා ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "நாளைய மதிய உணவுக்கு ஆர்டர் செய்யவும்"
                },
                dinner: {
                    English: "Order for tomorrow's dinner",
                    Sinhala: "හෙට දින රාත්‍රී ආහාරය සඳහා ඇණවුම් කරන්න",
                    Tamil: "நாளைய இரவு உணவுக்கு ஆர்டர் செய்யவும்"
                }
            }
        };
        return texts[selectedDate][selectedMeal][selectedLanguage];
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

    const loadMoreData = () => {
        if (loading) {
            return;
        }
        setLoading(true);
        fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
            .then((res) => res.json())
            .then((body) => {
                setData([...data, ...body.results]);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadMoreData();
    }, []);

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div>
                    <div className={styles.contentStyle1}>
                        <br />
                        <div><Typography.Title level={2} className={styles.getGreeting}>{getGreeting()}</Typography.Title></div>
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
                                <div><Typography.Title level={4} className={styles.getGreeting}>Secure & Quick Access — Scan your fingerprint to continue ordering your favorite meals!</Typography.Title></div>
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
                            <Carousel ref={innerCarouselRef} afterChange={(currentSlide) => console.log(currentSlide)} dots={false}>
                                <div className={styles.carouselItem}>
                                    <button className={styles.carouselItemHeadButton} onClick={() => { setSelectedDate('today'); nextInner(); }}>
                                        {getButtonText('today')} <br />({getTodayDate()})
                                    </button>
                                    <button className={styles.carouselItemHeadButton} style={{ backgroundColor: 'rgb(99, 5, 5)', color: 'white' }} onClick={() => { setSelectedDate('tomorrow'); nextInner(); }}>
                                        {getButtonText('tomorrow')} ✅ <br /> ({getTomorrowDate()})
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('breakfast'); next(); }}>
                                        {getButtonText('breakfast')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('lunch'); next(); }}>
                                        {getButtonText('lunch')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('dinner'); next(); }}>
                                        {getButtonText('dinner')}
                                    </button><br />
                                </div>
                                <div className={styles.carouselItem}>
                                    <button className={styles.carouselItemHeadButton} style={{ backgroundColor: 'rgb(99, 5, 5)', color: 'white' }} onClick={() => { setSelectedDate('today'); nextInner(); }}>
                                        {getButtonText('today')} ✅ <br />({getTodayDate()})
                                    </button>
                                    <button className={styles.carouselItemHeadButton} onClick={() => { setSelectedDate('tomorrow'); nextInner(); }}>
                                        {getButtonText('tomorrow')}<br /> ({getTomorrowDate()})
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('breakfast'); next(); }}>
                                        {getButtonText('breakfast')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('lunch'); next(); }}>
                                        {getButtonText('lunch')}
                                    </button><br />
                                    <button className={styles.mealButton} onClick={() => { setSelectedMeal('dinner'); next(); }}>
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
                        <br />
                        <div className={styles.headerContainer}>
                            <div className={styles.currentTime}>{currentDateTime}</div>
                            <div className={styles.userName}>John Wick</div>
                        </div>
                        <br />
                        <Card className={styles.cardStyle3}>
                            
                            <div><Typography.Title level={1} className={styles.mainTitle2}>{getOrderText()}</Typography.Title></div>
                            <div>
                            <Flex justify="center" align="center" direction="column">
                                    <div className={styles.cardPart3}>
                                        <div id="scrollableDiv" className={styles.scrollableDiv}>
                                            <InfiniteScroll
                                                dataLength={data.length}
                                                next={loadMoreData}
                                                hasMore={data.length < 50}
                                                loader={
                                                    <Skeleton
                                                        avatar
                                                        paragraph={{ rows: 1 }}
                                                        active
                                                    />
                                                }
                                                endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
                                                scrollableTarget="scrollableDiv"
                                            >
                                                <List
                                                    dataSource={data}
                                                    renderItem={(item) => (
                                                        <List.Item key={item.email}>
                                                            <List.Item.Meta
                                                                avatar={<Avatar src={item.picture.large} />}
                                                                title={<a href="https://ant.design">{item.name.last}</a>}
                                                                description={item.email}
                                                            />
                                                            <div>Content</div>
                                                        </List.Item>
                                                    )}
                                                />
                                            </InfiniteScroll>
                                        </div>
                                    </div>
                                    <div className={styles.cardPart4}>
                                        <Typography.Title level={2} className={styles.getGreeting}>Your Order</Typography.Title>
                                        
                                    </div>
                                </Flex>
                            </div>
                            <button className={styles.prevButton} onClick={() => carouselRef.current.prev()}>&lt;</button>
                        </Card>
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
import React, { useRef, useState } from 'react';
import { Carousel } from 'antd';
import styles from './OrderTab.module.css';
import Page1 from "../../organisms/OrderTabUI/Page1/Page1";
import Page2 from "../../organisms/OrderTabUI/Page2/Page2";
import Page3 from "../../organisms/OrderTabUI/Page3/Page3";

const OrderTab = () => {
    const carouselRef = useRef();
    const [language, setLanguage] = useState('english'); // State for selected language
    const [username, setUsername] = useState(""); // State to store the username
    const [userId, setUserId] = useState(""); // State to store the user ID

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={false} accessibility={false}>
                <div className={styles.contentStyle1}>
                    <Page1 carouselRef={carouselRef} setLanguage={setLanguage} /> {/* Pass setLanguage */}
                </div>
                <div className={styles.contentStyle2}>
                    <Page2
                        carouselRef={carouselRef}
                        language={language}
                        setUsername={setUsername}
                        setUserId={setUserId} // Pass setUserId
                    />
                </div>
                <div className={styles.contentStyle3}>
                    <Page3
                        carouselRef={carouselRef}
                        language={language}
                        username={username}
                        userId={userId} // Pass userId
                    />
                </div>
            </Carousel>
        </>
    );
};

export default OrderTab;
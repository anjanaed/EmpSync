import React, { useRef, useState } from 'react';
import { Carousel } from 'antd';
import styles from './OrderTab.module.css';
import Page1 from '../../components/OrderTabUI/Page1/Page1';
import Page2 from '../../components/OrderTabUI/Page2/Page2';
import Page3 from '../../components/OrderTabUI/Page3/Page3';

const OrderTab = () => {
    const carouselRef = useRef();
    const [language, setLanguage] = useState('english'); // State for selected language

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div className={styles.contentStyle1}>
                    <Page1 carouselRef={carouselRef} setLanguage={setLanguage} /> {/* Pass setLanguage */}
                </div>
                <div className={styles.contentStyle2}>
                    <Page2 carouselRef={carouselRef} language={language} /> {/* Pass language */}
                </div>
                <div className={styles.contentStyle3}>
                    <Page3 carouselRef={carouselRef} language={language} /> {/* Pass language */}
                </div>
            </Carousel>
        </>
    );
};

export default OrderTab;
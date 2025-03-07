import React from 'react';
import { Carousel } from 'antd';
import { Typography } from 'antd';
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
        } else if (currentHour < 18) {
            return "Good Afternoon සුභ දහවලක් වේවා மதிய வணக்கம்";
        } else {
            return "Good Evening සුභ සන්ධ්‍යාවක් වේවා மலை வணக்கம்";
        }
    };

    return (
        <>
            
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div>
                    <div className={styles.contentStyle1}>
                        <br />
                        <div><Typography.Title level={2} className={styles.getGreeting}>{getGreeting() }</Typography.Title></div>
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
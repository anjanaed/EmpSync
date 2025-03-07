import React from 'react';
import { Carousel } from 'antd';
import { Typography } from 'antd';
import styles from './OrderTab.module.css';


const OrderTab = () => {
    const carouselRef = React.useRef();

    const next = () => {
        carouselRef.current.next();
    };

    return (
        <>
            <Carousel ref={carouselRef} infinite={false} dots={true}>
                <div>
                    <div className={styles.contentStyle1}>
                        <br />
                        <div></div>
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
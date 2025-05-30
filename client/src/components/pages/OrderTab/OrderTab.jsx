import React, { useRef, useState } from 'react';
import { Carousel } from 'antd';
import styles from './OrderTab.module.css'; // Import CSS module for styling
import Page1 from "../../organisms/OrderTabUI/Page1/Page1"; // Import Page1 component
import Page2 from "../../organisms/OrderTabUI/Page2/Page2"; // Import Page2 component
import Page3 from "../../organisms/OrderTabUI/Page3/Page3"; // Import Page3 component

// OrderTab component to manage the carousel of ordering pages
const OrderTab = () => {
    const carouselRef = useRef(); // Reference to control the carousel
    const [language, setLanguage] = useState('english'); // State for selected language
    const [username, setUsername] = useState(""); // State to store the username
    const [userId, setUserId] = useState(""); // State to store the user ID
    const [resetPin, setResetPin] = useState(false); // Add this state

    // Render the carousel with three pages
    return (
        <>
            <Carousel
                ref={carouselRef}
                infinite={false} // Disable infinite looping
                dots={false} // Hide navigation dots
                accessibility={false} // Disable default accessibility features
                speed={0}
            >
                {/* Page 1: Language selection */}
                <div className={styles.contentStyle1}>
                    <Page1
                        carouselRef={carouselRef}
                        setLanguage={setLanguage} // Pass function to update language
                    />
                </div>
                {/* Page 2: Authentication */}
                <div className={styles.contentStyle2}>
                    <Page2
                        carouselRef={carouselRef}
                        language={language}
                        setUsername={setUsername} // Pass function to update username
                        setUserId={setUserId} // Pass function to update user ID
                        resetPin={resetPin}        // Add this prop
                        setResetPin={setResetPin}  // Add this prop
                    />
                </div>
                {/* Page 3: Meal selection and ordering */}
                <div className={styles.contentStyle3}>
                    <Page3
                        carouselRef={carouselRef}
                        language={language}
                        username={username}
                        userId={userId} // Pass user ID to Page3
                        setResetPin={setResetPin}  // Add this prop
                    />
                </div>
            </Carousel>
        </>
    );
};

// Export the OrderTab component
export default OrderTab;
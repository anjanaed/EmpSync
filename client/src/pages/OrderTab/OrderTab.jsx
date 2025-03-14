import { useEffect, useState } from "react"
import { Card as CustomCard, Button as CustomButton } from "../../components/OrderTabUI/Ui"
import { ChevronLeft, Check } from "lucide-react"
import { Carousel, Image, Typography, Button, Card, Flex, Avatar, List, Radio, Space } from 'antd';
import styles from './OrderTab.module.css';
// Define meal data
const mealData = [
  {
    id: 1,
    name: {
      English: "Greek Yogurt with Berries & Nuts",
      Sinhala: "බෙරි සහ නට්ස් සමඟ ග්‍රීක යෝගට්",
      Tamil: "பெர்ரிகள் & நட்ஸ் உடன் கிரேக்க யோகர்ட்",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 2,
    name: {
      English: "Denver Omelette",
      Sinhala: "ඩෙන්වර් ඔම්ලට්",
      Tamil: "டென்வர் ஆம்லெட்",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 3,
    name: {
      English: "Garden Omelette",
      Sinhala: "උද්යාන ඔම්ලට්",
      Tamil: "கார்டன் ஆம்லெட்",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 4,
    name: {
      English: "Roasted Red Pepper & Zucchini Frittata",
      Sinhala: "රෝස්ට් කළ රතු ගම්මිරිස් සහ සුකිනි ෆ්‍රිටාටා",
      Tamil: "வறுத்த சிவப்பு மிளகு & சுக்கினி ஃப்ரிட்டாட்டா",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 5,
    name: {
      English: "Green Chile & Sausage Frittata",
      Sinhala: "කොළ මිරිස් සහ සොසේජ් ෆ්‍රිටාටා",
      Tamil: "பச்சை மிளகாய் & சாசேஜ் ஃப்ரிட்டாட்டா",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 6,
    name: {
      English: "Homestyle Steel Cut Oatmeal",
      Sinhala: "හෝම්ස්ටයිල් ස්ටීල් කට් ඕට්මීල්",
      Tamil: "ஹோம்ஸ்டைல் ஸ்டீல் கட் ஓட்மீல்",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "breakfast",
  },
  {
    id: 7,
    name: {
      English: "Orange Ginger Beef & Broccoli w/ Brown Rice",
      Sinhala: "තැඹිලි ඉඟුරු බීෆ් සහ බ්‍රොකොලි සමඟ බුරුල් සහල්",
      Tamil: "ஆரஞ்சு இஞ்சி பீஃப் & ப்ரோக்கோலி பிரவுன் ரைஸ் உடன்",
    },
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3.jpg-gMhXXCMXYvAD2jMezuVU5G1kajkxeb.jpeg",
    category: "lunch",
  },
]


export default function OrderTab() {
    // State variables
    const [selectedLanguage, setSelectedLanguage] = useState("English")
    const [currentScreen, setCurrentScreen] = useState(0)
    const [selectedDate, setSelectedDate] = useState("today")
    const [selectedMeal, setSelectedMeal] = useState("breakfast")
    const [selectedMeals, setSelectedMeals] = useState([])
    const [userName, setUserName] = useState("John Wick")
    const [employeeId, setEmployeeId] = useState("")
    const [currentDateTime, setCurrentDateTime] = useState("")
  
    // Update current date and time
    useEffect(() => {
      const updateDateTime = () => {
        const now = new Date()
        const options = {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }
        setCurrentDateTime(now.toLocaleDateString("en-US", options))
      }
  
      updateDateTime()
      const interval = setInterval(updateDateTime, 1000)
  
      return () => clearInterval(interval)
    }, [])
  
    // Get greeting based on time of day
    const getGreeting = () => {
      const currentHour = new Date().getHours()
      if (currentHour < 12) {
        return {
          English: "Good Morning",
          Sinhala: "සුභ උදෑසනක් වේවා",
          Tamil: "காலை வணக்கம்",
        }
      } else if (currentHour < 17) {
        return {
          English: "Good Afternoon",
          Sinhala: "සුභ දහවලක් වේවා",
          Tamil: "மதிய வணக்கம்",
        }
      } else {
        return {
          English: "Good Evening",
          Sinhala: "සුභ සන්ධ්‍යාවක් වේවා",
          Tamil: "மாலை வணக்கம்",
        }
      }
    }
  
    // Get today's date formatted
    const getTodayDate = () => {
      const now = new Date()
      const options = { weekday: "short", month: "short", day: "numeric" }
      return now.toLocaleDateString("en-US", options)
    }
  
    // Get tomorrow's date formatted
    const getTomorrowDate = () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const options = { weekday: "short", month: "short", day: "numeric" }
      return tomorrow.toLocaleDateString("en-US", options)
    }
  
    // Get text based on selected language
    const getText = (key) => {
      const texts = {
        welcomeTitle: {
          English: "Welcome to Helix Food Ordering",
          Sinhala: "Helix Food Ordering වෙත සාදරයෙන් පිළිගනිමු",
          Tamil: "ஹெலிக்ஸ் உணவு ஆர்டரிங்கிற்கு வரவேற்கிறோம்",
        },
        selectLanguage: {
          English: "Select your language",
          Sinhala: "Select your language",
          Tamil: "Select your language",
        },
        employeeId: {
          English: "Enter Your Employee ID Number to Continue",
          Sinhala: "ඉදිරියට යාමට ඔබේ සේවක හැඳුනුම්පත් අංකය ඇතුළත් කරන්න",
          Tamil: "தொடர உங்கள் பணியாளர் ஐடி எண்ணை உள்ளிடவும்",
        },
        secureAccess: {
          English: "Secure & Quick Access — Enter your ID number to continue ordering your favorite meals!",
          Sinhala: "ආරක්ෂිත සහ ඉක්මන් ප්‍රවේශය — ඔබේ ප්‍රියතම ආහාර ඇණවුම් කිරීම සඳහා ඔබේ හැඳුනුම්පත් අංකය ඇතුළත් කරන්න!",
          Tamil: "பாதுகாப்பான & விரைவான அணுகல் — உங்கள் பிடித்த உணவுகளை ஆர்டர் செய்ய உங்கள் ஐடி எண்ணை உள்ளிடவும்!",
        },
        selectDateMeal: {
          English: "Select Date and Meal Time",
          Sinhala: "දිනය සහ ආහාර වේල තෝරන්න",
          Tamil: "தேதி மற்றும் உணவை தேர்ந்தெடுக்கவும்",
        },
        today: {
          English: "Today",
          Sinhala: "අද",
          Tamil: "இன்று",
        },
        tomorrow: {
          English: "Tomorrow",
          Sinhala: "හෙට",
          Tamil: "நாளை",
        },
        breakfast: {
          English: "Breakfast",
          Sinhala: "උදේ ආහාරය",
          Tamil: "காலை உணவு",
        },
        lunch: {
          English: "Lunch",
          Sinhala: "දවල් ආහාරය",
          Tamil: "மதிய உணவு",
        },
        dinner: {
          English: "Dinner",
          Sinhala: "රාත්‍රී ආහාරය",
          Tamil: "இரவு உணவு",
        },
        chooseMeals: {
          English: "CHOOSE MEALS",
          Sinhala: "ආහාර තෝරන්න",
          Tamil: "உணவுகளைத் தேர்ந்தெடுக்கவும்",
        },
        placeOrder: {
          English: "Place Order",
          Sinhala: "ඇණවුම් කරන්න",
          Tamil: "ஆர்டர் செய்யவும்",
        },
        yourOrder: {
          English: "YOUR ORDER",
          Sinhala: "ඔබගේ ඇණවුම",
          Tamil: "உங்கள் ஆர்டர்",
        },
        addMeals: {
          English: "Add Meals",
          Sinhala: "ආහාර එකතු කරන්න",
          Tamil: "உணவுகளைச் சேர்க்கவும்",
        },
        next: {
          English: "Next",
          Sinhala: "ඊළඟ",
          Tamil: "அடுத்து",
        },
        back: {
          English: "Back",
          Sinhala: "ආපසු",
          Tamil: "பின்",
        },
      }
  
      return texts[key]?.[selectedLanguage] || key

    }
  
    // Get order text based on selected date and meal
    const getOrderText = () => {
      const texts = {
        today: {
          breakfast: {
            English: "Order for today's breakfast",
            Sinhala: "අද දින උදෑසන ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "இன்றைய காலை உணவுக்கு ஆர்டர் செய்யவும்",
          },
          lunch: {
            English: "Order for today's lunch",
            Sinhala: "අද දින දිවා ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "இன்றைய மதிய உணவுக்கு ஆர்டர் செய்யவும்",
          },
          dinner: {
            English: "Order for today's dinner",
            Sinhala: "අද දින රාත්‍රී ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "இன்றைய இரவு உணவுக்கு ஆர்டர் செய்யவும்",
          },
        },
        tomorrow: {
          breakfast: {
            English: "Order for tomorrow's breakfast",
            Sinhala: "හෙට දින උදෑසන ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "நாளைய காலை உணவுக்கு ஆர்டர் செய்யவும்",
          },
          lunch: {
            English: "Order for tomorrow's lunch",
            Sinhala: "හෙට දින දිවා ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "நாளைய மதிய உணவுக்கு ஆர்டர் செய்யவும்",
          },
          dinner: {
            English: "Order for tomorrow's dinner",
            Sinhala: "හෙට දින රාත්‍රී ආහාරය සඳහා ඇණවුම් කරන්න",
            Tamil: "நாளைய இரவு உணவுக்கு ஆர்டர் செய்யவும்",
          },
        },
      }
  
      return texts[selectedDate][selectedMeal][selectedLanguage]
    }
  
    // Add a meal to the selected meals
    const addMeal = (mealId) => {
      if (selectedMeals.includes(mealId)) {
        setSelectedMeals(selectedMeals.filter((id) => id !== mealId))
      } else {
        if (selectedMeals.length < 10) {
          setSelectedMeals([...selectedMeals, mealId])
        }
      }
    }
  
    // Handle keypad input for employee ID
    const handleKeypadInput = (value) => {
      if (value === "backspace") {
        setEmployeeId((prev) => prev.slice(0, -1))
      } else if (value === "clear") {
        setEmployeeId("")
      } else if (value === "enter") {
        if (employeeId.length > 0) {
          setCurrentScreen(1)
        }
      } else {
        setEmployeeId((prev) => prev + value)
      }
    }
  
    // Determine if Tamil text should be smaller
    const isSmallTamilText = selectedLanguage === "Tamil";

    // Render the language selection screen
    const renderLanguageScreen = () => {
      return (
        <div className={styles.contentStyle1}>
            <br />
            <Typography.Title level={2} className={`${styles.getGreeting} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
              {getGreeting().English} {getGreeting().Sinhala} {getGreeting().Tamil}
            </Typography.Title>
            <Typography.Title level={1} className={`${styles.mainTitle1} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
            Welcome to Helix Food Ordering
            </Typography.Title>
            <Typography.Title level={2} className={`${styles.dateAndTime} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
              {currentDateTime}
            </Typography.Title>
            <br /><br />
          
    
          <Card className={styles.cardStyle}>
          <Typography.Title level={1} className={styles.t2}>Select your language | භාෂාව තෝරන්න | மொழியை தேர்ந்தெடுக்கவும்</Typography.Title>
            <Flex justify="center" align="center" direction="column" className={styles.flexText}>
               
    
                <div className={`${styles['language-selection-container']} ${styles.cardPart2}`}>
                    
                    <br />
                    <div className={styles['language-buttons-container']}>
                        <button className={styles.languageButton} 
                            onClick={() => {setSelectedLanguage("English"),setCurrentScreen(1)}}>English 
                        </button><br /><br />
                        <button className={styles.languageButton} 
                            onClick={() => {setSelectedLanguage("Sinhala"),setCurrentScreen(1)}}>සිංහල 
                        </button><br /><br />
                        <button className={styles.languageButton} 
                            onClick={() => {setSelectedLanguage("Tamil"),setCurrentScreen(1)}}>தமிழ் 
                        </button><br /><br />
                    </div>
                </div>
            </Flex>
            
          </Card>
        </div>
      )
    }
    
    const employeeVerify = () => {
        return (
          <div className={styles.contentStyle1}>
              <br />
              <Typography.Title level={2} className={`${styles.getGreeting} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
                {getGreeting().English} {getGreeting().Sinhala} {getGreeting().Tamil}
              </Typography.Title>
              <Typography.Title level={1} className={`${styles.mainTitle1} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
              Welcome to Helix Food Ordering
              </Typography.Title>
              <Typography.Title level={2} className={`${styles.dateAndTime} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
                {currentDateTime}
              </Typography.Title>
            <br /><br />
      
            <Card className={styles.cardStyle}>
                <Typography.Title level={2} className={`${styles.getGreeting} ${isSmallTamilText ? styles.smallTamilText : ''}`}>
                            {getText("employeeId")}
                        </Typography.Title>
                        
              <Flex justify="center" align="center" direction="column" className={styles.flexText}>
                  <div className={`${styles['flex-col-center']} ${styles.cardPart1}`}>
                      
                      <div className={styles['input-container']}>
                          <input
                              type="text"
                              value={employeeId}
                              readOnly
                              className={`${styles['input-field']} `}
                          />
                          <div className={styles['keypad-grid']}>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <Button
                                  key={num}
                                  onClick={() => handleKeypadInput(num.toString())}
                                  variant="outline"
                                  className={`${styles['keypad-button']} `}
                              >
                                  {num}
                              </Button>
                              ))}
                              <Button onClick={() => handleKeypadInput("E")} variant="outline" className={`${styles['keypad-button']} `}>
                              E
                              </Button>
                              <Button onClick={() => handleKeypadInput("0")} variant="outline" className={`${styles['keypad-button']} `}>
                              0
                              </Button>
                              <Button onClick={() => handleKeypadInput("backspace")} variant="outline" className={`${styles['keypad-button']} `}>
                              ⌫
                              </Button>
                              <Button
                              onClick={() => setCurrentScreen(2)}
                              variant="outline"
                              className={`${styles['keypad-button']} ${styles['keypad-button-enter']} `}
                              >
                              →
                              </Button>
                          </div>
                          
                      </div>
                      
                  </div>
      
                  
              </Flex>
              
            </Card>
            <button className={styles.prevButton} onClick={() => setCurrentScreen(0)}>&lt;</button>
            
          </div>
        )
      }
  
    // Render the date and meal selection screen
    const renderDateMealScreen = () => {
        return (
          <div className={styles.contentStyle1}>
            <div className={styles.dateMealContainer}>
              <div className={styles.headerContainer}>
            <div className="text-xl">{currentDateTime}</div>
            <div className="text-xl">{userName}</div>
              </div>
          
              <Card className={styles.cardStyle2}>
            <div className={styles.dateMealCardContent}>
              <Typography.Title level={1} className={styles.mainTitle2}>{getText("selectDateMeal")}</Typography.Title>
          
              <div className={styles.dateMealButtons}>
                <Button
                  onClick={() => setSelectedDate("today")}
                  type={selectedDate === "today" ? "primary" : "default"}
                  className={styles.dateMealButton}
                >
                  {getText("today")}
                  {selectedDate === "today" && <Check className={styles.checkIcon} />}
                  <br />({getTodayDate()})
                </Button>
                <Button
                  onClick={() => setSelectedDate("tomorrow")}
                  type={selectedDate === "tomorrow" ? "primary" : "default"}
                  className={styles.dateMealButton}
                >
                  {getText("tomorrow")}
                  {selectedDate === "tomorrow" && <Check className={styles.checkIcon} />}
                  <br />({getTomorrowDate()})
                </Button>
              </div>
          
              <div className={styles.mealSelectionButtons}><br />
                <Button
                  onClick={() => {
                setSelectedMeal("breakfast")
                setCurrentScreen(3)
                  }}
                  type="default"
                  className={styles.mealSelectionButton}
                >
                  {getText("breakfast")}
                </Button><br /><br />
                <Button
                  onClick={() => {
                setSelectedMeal("lunch")
                setCurrentScreen(3)
                  }}
                  type="default"
                  className={styles.mealSelectionButton}
                >
                  {getText("lunch")}
                </Button><br /><br />
                <Button
                  onClick={() => {
                setSelectedMeal("dinner")
                setCurrentScreen(3)
                  }}
                  type="default"
                  className={styles.mealSelectionButton}
                >
                  {getText("dinner")}
                </Button>
              </div>
            </div>
          
            
              </Card>
              <button className={styles.prevButton} onClick={() => setCurrentScreen(1)}>&lt;</button>
            </div>
          </div>
        )
      }
  
    // Render the meal selection screen
    const renderMealSelectionScreen = () => {
      const filteredMeals = mealData.filter((meal) => meal.category === selectedMeal)
      const selectedMealsData = mealData.filter((meal) => selectedMeals.includes(meal.id))
  
    return (
      <div className={styles.contentStyle1}>
        <div className={styles.dateMealContainer}>
        <div className={styles.headerContainer}>
          <div className="text-xl">{currentDateTime}</div>
          <div className="text-xl">{userName}</div>
        </div>

        <Card className={styles.cardStyle2}>
          <div className={styles.dateMealCardContent}>
            <Typography.Title level={1} className={styles.mainTitle2}>{getText("chooseMeals")}</Typography.Title>
            <p className="text-gray-600 mb-6">
            All FiveStar meals are free of gluten, wheat, refined sugars, peanuts, artificial colors, and artificial
            flavors.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            <div className="md:col-span-3 p-4">
              <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-6 mb-2">
                <Button
                  type={selectedMeal === "breakfast" ? "primary" : "default"}
                  onClick={() => setSelectedMeal("breakfast")}
                  className={selectedMeal === "breakfast" ? "border-b-2 border-lime-500 rounded-none" : ""}
                >
                  {getText("breakfast")}
                </Button>
                <Button
                  type={selectedMeal === "lunch" ? "primary" : "default"}
                  onClick={() => setSelectedMeal("lunch")}
                  className={selectedMeal === "lunch" ? "border-b-2 border-lime-500 rounded-none" : ""}
                >
                  {getText("lunch")}
                </Button>
                <Button
                  type={selectedMeal === "dinner" ? "primary" : "default"}
                  onClick={() => setSelectedMeal("dinner")}
                  className={selectedMeal === "dinner" ? "border-b-2 border-lime-500 rounded-none" : ""}
                >
                  {getText("dinner")}
                </Button>
                <div className="flex-grow"></div>
                <Button type="default">FILTER</Button>
                </div>
              </div>

              <Typography.Title level={2} className="text-center uppercase">{getText(selectedMeal)}</Typography.Title>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredMeals.map((meal) => (
                <Card key={meal.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                    src={meal.image || "/placeholder.svg?height=200&width=300"}
                    alt={meal.name[selectedLanguage]}
                    fill
                    className="object-cover"
                    />
                    {selectedMeals.includes(meal.id) && (
                    <div className="absolute inset-0 bg-lime-500 bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <Check className="h-8 w-8 text-lime-500" />
                      </div>
                    </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Typography.Title level={3} className="text-center font-medium uppercase">{meal.name[selectedLanguage]}</Typography.Title>
                    <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => addMeal(meal.id)}
                      type={selectedMeals.includes(meal.id) ? "primary" : "default"}
                      className={selectedMeals.includes(meal.id) ? "bg-lime-500 hover:bg-lime-600" : ""}
                    >
                      {selectedMeals.includes(meal.id) ? "ADDED" : "ADD"}
                    </Button>
                    </div>
                  </div>
                </Card>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 p-4">
              <Typography.Title level={2} className="mb-4">{getText("yourOrder")}</Typography.Title>

              <div className="space-y-4 mb-6">
                {selectedMealsData.map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 bg-white p-2 rounded-md">
                  <div className="relative h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                    <Image
                    src={meal.image || "/placeholder.svg?height=64&width=64"}
                    alt={meal.name[selectedLanguage]}
                    fill
                    className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{meal.name[selectedLanguage]}</p>
                  </div>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => addMeal(meal.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ×
                  </Button>
                </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">{selectedMeals.length}/10</span>
                <Button
                onClick={() => alert("Order placed successfully!")}
                className="bg-lime-500 hover:bg-lime-600"
                disabled={selectedMeals.length === 0}
                >
                {getText("next")}
                </Button>
              </div>
            </div>
            </div>
          </div>
        </Card>
        <Button onClick={() => setCurrentScreen(1)} type="default" className="bg-white">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {getText("back")}
        </Button>
        </div>
      </div>
    )
    }
  
    // Render the appropriate screen based on currentScreen state
    return (
      <div>
        {currentScreen === 0 && renderLanguageScreen()}
        {currentScreen === 1 && employeeVerify()}
        {currentScreen === 2 && renderDateMealScreen()}
        {currentScreen === 3 && renderMealSelectionScreen()}
      </div>
    )
  }
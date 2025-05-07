
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY5NZGpTg4EAU2O7eXWz3ptSczuLUmgFc", 
  authDomain: "empsync-af358.firebaseapp.com",
  projectId: "empsync-af358",
  storageBucket: "empsync-af358.firebasestorage.app", 
  messagingSenderId: "94649504412",
  appId: "1:94649504412:web:4879858809df333e715359",
  measurementId: "G-DGFHF94LXP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);



export { storage };
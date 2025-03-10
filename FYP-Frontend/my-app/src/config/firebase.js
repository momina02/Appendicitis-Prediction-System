


// Import necessary Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "appendicitis-73db1.firebaseapp.com",
  projectId: "appendicitis-73db1",
  storageBucket: "appendicitis-73db1.firebasestorage.app",
  messagingSenderId: "260150162532",
  appId: "1:260150162532:web:6d5bdd85eb99835dc4db71",
  measurementId: "G-YHG510HPG3"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5KDu5MOw_X1v2_zAGwypYskg0-ujEt-w",
  authDomain: "testappautomation.firebaseapp.com",
  databaseURL: "https://testappautomation-default-rtdb.firebaseio.com",
  projectId: "testappautomation",
  storageBucket: "testappautomation.firebasestorage.app",
  messagingSenderId: "669586568279",
  appId: "1:669586568279:web:2768b60057ec74cdb99f12",
  measurementId: "G-MQM10VTR2S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { db, auth };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt3kHXkiYlDbS4uFonPuOUcDl1ysBEyTo",
  authDomain: "bnbgourmet-76acd.firebaseapp.com",
  projectId: "bnbgourmet-76acd",
  storageBucket: "bnbgourmet-76acd.firebasestorage.app",
  messagingSenderId: "21467775529",
  appId: "1:21467775529:web:f76b00a71354ef46ab1238"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
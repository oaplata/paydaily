// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKcXTrtELXZoQcIPNlYdcSPkE3SoKtfjw",
  authDomain: "paydaily-bfe7f.firebaseapp.com",
  projectId: "paydaily-bfe7f",
  storageBucket: "paydaily-bfe7f.appspot.com",
  messagingSenderId: "152571612614",
  appId: "1:152571612614:web:5d112a2ff7f35c10a6f6c7",
  measurementId: "G-VDPJJDLYVM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);


export default app;

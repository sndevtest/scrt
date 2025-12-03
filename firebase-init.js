import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBS-g5bFBaJ6a35hWmjvoN-s8FuMEuxtew",
  authDomain: "pasakay-project-ph.firebaseapp.com",
  databaseURL: "https://pasakay-project-ph-default-rtdb.firebaseio.com",
  projectId: "pasakay-project-ph",
  storageBucket: "pasakay-project-ph.firebasestorage.app",
  messagingSenderId: "189297787561",
  appId: "1:189297787561:web:b46010c0b54e5611d8dfb8",
  measurementId: "G-36YLYMKCX9"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
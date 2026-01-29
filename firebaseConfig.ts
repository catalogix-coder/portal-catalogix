
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC9WxbbkosE5tllzj1ZoqnQB0evJjSiWlU",
  authDomain: "catalogix-portal.firebaseapp.com",
  projectId: "catalogix-portal",
  storageBucket: "catalogix-portal.firebasestorage.app",
  messagingSenderId: "281833076648",
  appId: "1:281833076648:web:1822cc40e88debecb38f9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

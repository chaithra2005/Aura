import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAMd5v-Zr7gF9YqVIsSUZGhik2yCIsntDE",
  authDomain: "chaithra-e2135.firebaseapp.com",
  projectId: "chaithra-e2135",
  storageBucket: "chaithra-e2135.appspot.com",
  messagingSenderId: "681305578959",
  appId: "1:681305578959:web:0b6bb827cbb877fe5a86ba",
  measurementId: "G-QRL4HBTCE6"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth, onAuthStateChanged };
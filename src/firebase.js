import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { getStorage } from "firebase/storage"; // ✅ Import Firebase Storage

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAMd5v-Zr7gF9YqVIsSUZGhik2yCIsntDE",
  authDomain: "chaithra-e2135.firebaseapp.com",
  projectId: "chaithra-e2135",
  storageBucket: "chaithra-e2135.appspot.com",
  messagingSenderId: "681305578959",
  appId: "1:681305578959:web:0b6bb827cbb877fe5a86ba",
  measurementId: "G-QRL4HBTCE6"
};

// ✅ Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app); // ✅ Initialize Storage

// ✅ Export everything needed
export { db, auth, provider, onAuthStateChanged, storage };

// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBmtwhKD-1JH3UtzqDNXjvYIrnl4m7QgvU",
  authDomain: "adv-project-e8067.firebaseapp.com",
  projectId: "adv-project-e8067",
  storageBucket: "adv-project-e8067.appspot.com",
  messagingSenderId: "361157144696",
  appId: "1:361157144696:web:b2e9186d8241eb51c03d8d",
  measurementId: "G-HG8JB9B02J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { app, auth, storage, db };

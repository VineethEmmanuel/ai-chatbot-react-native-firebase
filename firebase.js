import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCp-HFkQgjb7x0mg0OHeNbt1IOoD6lfM-k",
  authDomain: "ai-chatbot-rn.firebaseapp.com",
  projectId: "ai-chatbot-rn",
  storageBucket: "ai-chatbot-rn.firebasestorage.app",
  messagingSenderId: "835798859204",
  appId: "1:835798859204:web:147472f2f21f1fad757891",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);

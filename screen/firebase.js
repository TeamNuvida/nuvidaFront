// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Firestore 모듈 가져오기
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDZuZsmJDYEWp5arnfRc6pSqMd0WAt01kU",
    authDomain: "high-service-431903-t6.firebaseapp.com",
    projectId: "high-service-431903-t6",
    storageBucket: "high-service-431903-t6.appspot.com",
    messagingSenderId: "797041135189",
    appId: "1:797041135189:android:bfe45b46755c233195cedc"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 및 Storage 초기화
export const firestore = getFirestore(app);
export const storage = getStorage(app);

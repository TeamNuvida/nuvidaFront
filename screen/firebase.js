// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Firestore 모듈 가져오기
import { getStorage } from 'firebase/storage';

const firebaseConfig = {

};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 및 Storage 초기화
export const firestore = getFirestore(app);
export const storage = getStorage(app);

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBe75QSL5wwDujK-qiQiaoRPWVnoosQXXk",
  authDomain: "jiajun-expense-tracker.firebaseapp.com",
  projectId: "jiajun-expense-tracker",
  storageBucket: "jiajun-expense-tracker.firebasestorage.app",
  messagingSenderId: "178818108989",
  appId: "1:178818108989:web:7c03cb2e514a0afb9fe454",
  measurementId: "G-QZ8NV3PEV0"
};

// Firebase Providers
export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()),
];

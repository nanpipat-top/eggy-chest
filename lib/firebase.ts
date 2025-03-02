import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBznTgncqUDEWOIrIvEHgm1OQ-ctABPjDo",
  authDomain: "eggy-chest.firebaseapp.com",
  projectId: "eggy-chest",
  storageBucket: "eggy-chest.appspot.com",
  messagingSenderId: "432567028381",
  appId: "1:432567028381:web:6abd0da030edab2517e274",
  measurementId: "G-32KCB0GYQ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Use local emulators for development if needed
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these lines to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app, db, auth };
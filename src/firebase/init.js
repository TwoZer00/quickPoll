// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || process.env.VITE_FIREBASE_APIKEY,
  authDomain: 'quickpoll-c8b6e.firebaseapp.com',
  projectId: 'quickpoll-c8b6e',
  storageBucket: 'quickpoll-c8b6e.appspot.com',
  messagingSenderId: '529805916913',
  appId: '1:529805916913:web:c990b370194be95bd24750',
  measurementId: 'G-6EK3CVDTQJ'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
if (import.meta.env.VITE_ENV) {
  connectFirestoreEmulator(getFirestore(), '127.0.0.1', 8080)
  connectAuthEmulator(getAuth(), 'http://127.0.0.1:9099')
}
export {
  app
}

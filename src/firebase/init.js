// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const env = (key) => import.meta.env[key] || process.env[key]

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_APIKEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
  measurementId: env('VITE_FIREBASE_MEASUREMENT_ID')
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
if (import.meta.env.VITE_ENV) {
  connectFirestoreEmulator(getFirestore(), (import.meta.env.VITE_LOCAL_FIREBASE || process.env.VITE_LOCAL_FIREBASE), 8080)
  connectAuthEmulator(getAuth(), `http://${(import.meta.env.VITE_LOCAL_FIREBASE || process.env.VITE_LOCAL_FIREBASE)}:9099`, { disableWarnings: true })
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
} else {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(env('VITE_RECAPTCHA_SITE_KEY')),
    isTokenAutoRefreshEnabled: true
  })
}
export {
  app
}

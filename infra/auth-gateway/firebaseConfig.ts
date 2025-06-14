import { from } from 'env-var'

const env = from({
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
})

export const firebaseConfig = {
  apiKey: env.get('EXPO_PUBLIC_FIREBASE_API_KEY').required().asString(),
  authDomain: env.get('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN').required().asString(),
  projectId: env.get('EXPO_PUBLIC_FIREBASE_PROJECT_ID').required().asString(),
  storageBucket: env
    .get('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET')
    .required()
    .asString(),
  messagingSenderId: env
    .get('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')
    .required()
    .asString(),
  appId: env.get('EXPO_PUBLIC_FIREBASE_APP_ID').required().asString(),
  measurementId: env
    .get('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID')
    .required()
    .asString(),
}


import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseConfig } from './firebase-config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp, firebaseConfig.storage);


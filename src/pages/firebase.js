// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC_6rneCCokJMNhuXsaLJiWbvp6Lfl1toU",
    authDomain: "parulrec.firebaseapp.com",
    projectId: "parulrec",
    storageBucket: "parulrec.firebasestorage.app",
    messagingSenderId: "382122569635",
    appId: "1:382122569635:web:35ad8eead382a3b65a3416"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);


export const auth=getAuth();

export const db = getFirestore(app);
export default app;
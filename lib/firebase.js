// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyCRPjtZIfWfg1AB7rFOKhfo0PPMICQET8k",
    authDomain: "grocery-list-1493b.firebaseapp.com",
    projectId: "grocery-list-1493b",
    storageBucket: "grocery-list-1493b.appspot.com",
    messagingSenderId: "866716009216",
    appId: "1:866716009216:web:0a988b36021d105ff0e9e5",
    measurementId: "G-FQ8VDS54QB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };
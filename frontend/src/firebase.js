// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD8OwSZMRBc91hpBiujl15FlPgoJaGu0BI",
  authDomain: "codestreak-5ae79.firebaseapp.com",
  projectId: "codestreak-5ae79",
  storageBucket: "codestreak-5ae79.appspot.com",
  messagingSenderId: "1017688192182",
  appId: "1:1017688192182:web:68edac813b01959b256217",
  measurementId: "G-S8WES56P6X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEdlzK0vCo_4lKp0zjwWNfubyZiEKAUfk",
  authDomain: "pantryapp-e8c92.firebaseapp.com",
  projectId: "pantryapp-e8c92",
  storageBucket: "pantryapp-e8c92.appspot.com",
  messagingSenderId: "870729902925",
  appId: "1:870729902925:web:7e8becce277667ad106504"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export{app,firestore}
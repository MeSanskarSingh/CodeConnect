import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB-20X3u98KRFnhmES4IrPIdTN9wxuM_vk",
    authDomain: "codeconnect-40e7c.firebaseapp.com",
    projectId: "codeconnect-40e7c",
    storageBucket: "codeconnect-40e7c.appspot.com",
    messagingSenderId: "810631777812",
    appId: "1:810631777812:web:b41f5c46bb4ec74313a101",
    measurementId: "G-Z9PCD3TG5C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Firebase Initialized");

document.querySelector(".btn2").addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in:", result.user);
        alert(`Welcome, ${result.user.displayName}!`);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert(error.message);
    }
});

document.querySelector(".btn1").addEventListener("click", () => {
    alert("Email Sign-In feature coming soon!");
});

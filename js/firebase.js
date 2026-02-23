import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1wnHQKepTIzcH136VCq-GsuZBa6iUjh0",
  authDomain: "plantpro-98578.firebaseapp.com",
  projectId: "plantpro-98578",
  storageBucket: "plantpro-98578.firebasestorage.app",
  messagingSenderId: "282759390813",
  appId: "1:282759390813:web:e48b187a304a4b10b54fb4"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// დაცული გვერდებისთვის — login-ზე გადაამისამართებს თუ არ არის შესული
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = '/login.html';
    } else {
      if (callback) callback(user);
    }
  });
}

// გამოსვლა
export function logout() {
  signOut(auth).then(() => {
    window.location.href = '/login.html';
  });
}

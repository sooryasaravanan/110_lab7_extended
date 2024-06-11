const { initializeApp } = require("firebase/app");
const { getAuth, GoogleAuthProvider, signInWithPopup } = require("firebase/auth");
const { getFirestore, doc, getDoc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAw0HJqsOhy8QJvHmQfgxx1qxefDMa8lBU",
  authDomain: "project-dca7d.firebaseapp.com",
  projectId: "project-dca7d",
  storageBucket: "project-dca7d.appspot.com",
  messagingSenderId: "25737339701",
  appId: "1:25737339701:web:1731a47d781b02a9e8227c",
  measurementId: "G-8ZTK6EDHG4",
  clientId: "25737339701-ov14i213n9abuo9sibq4me9nnsst0t2m.apps.googleusercontent.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
      });
    }

    return user;
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
}

module.exports = { auth, firestore, googleProvider, signInWithGoogle, doc, getDoc, setDoc };

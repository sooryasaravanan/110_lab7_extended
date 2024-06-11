import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAw0HJqsOhy8QJvHmQfgxx1qxefDMa8lBU",
  authDomain: "project-dca7d.firebaseapp.com",
  projectId: "project-dca7d",
  storageBucket: "project-dca7d.appspot.com",
  messagingSenderId: "25737339701",
  appId: "1:25737339701:web:1731a47d781b02a9e8227c",
  measurementId: "G-8ZTK6EDHG4",
  clientId: "25737339701-ov14i213n9abuo9sibq4me9nnsst0t2m.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

async function signInWithGoogle() {
  console.log('signInWithGoogle called');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: idToken })
    });
    if (response.ok) {
      window.location.href = response.url;
    } else {
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Error during Google login:', error);
  }
}

document.getElementById('google-login').addEventListener('click', signInWithGoogle);

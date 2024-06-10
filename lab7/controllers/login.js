const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json'); // Ensure the path is correct

// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://project-dca7d.firebaseio.com"
    });
}

const auth = getAuth();
const firestore = getFirestore();

async function loginHandler(req, res) {
    const idToken = req.body.token;
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userDocRef = firestore.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        res.cookie('uid', uid); // Set UID in cookies

        if (!userDoc.exists) {
            return res.redirect('/create-profile'); // Redirect to create profile if user does not exist
        } else {
            return res.redirect('/home'); // Redirect to home if user exists
        }
    } catch (error) {
        console.error('Error verifying ID token:', error);
        res.status(500).send('Error verifying ID token');
    }
}

function renderLoginPage(req, res) {
    res.render('login', { title: 'Login' });
}

async function createProfileHandler(req, res) {
    const { uid, displayName, email } = req.body;
    const userDocRef = firestore.collection('users').doc(uid);
    await userDocRef.set({
        displayName,
        email,
        uid
    });
    res.redirect('/home');
}

function renderCreateProfilePage(req, res) {
    const uid = req.cookies.uid; // Assuming the user UID is stored in a cookie after login
    res.render('create-profile', { title: 'Create Profile', uid });
}

module.exports = { loginHandler, renderLoginPage, createProfileHandler, renderCreateProfilePage };

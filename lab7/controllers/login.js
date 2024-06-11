const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json'); 

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

        res.cookie('uid', uid); 

        if (!userDoc.exists) {
            return res.redirect('/create-profile'); 
        } else {
            const user = userDoc.data();
            if (user.email === 'sooryasarva@gmail.com') {
                return res.redirect('/admin');
            } else {
                return res.redirect('/home');
            }
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
    if (email === 'sooryasarva@gmail.com') {
        res.redirect('/admin');
    } else {
        res.redirect('/home');
    }
}

function renderCreateProfilePage(req, res) {
    const uid = req.cookies.uid; 
    res.render('create-profile', { title: 'Create Profile', uid });
}

module.exports = { loginHandler, renderLoginPage, createProfileHandler, renderCreateProfilePage };

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json'); // Ensure the path is correct

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://project-dca7d.firebaseio.com"
    });
}

const auth = getAuth();
const firestore = getFirestore();

module.exports = { auth, firestore };

const { connectToDatabase } = require('../db');
const { ObjectId } = require('mongodb');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccountKey.json');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://project-dca7d.firebaseio.com"
    });
}

const firestore = getFirestore();

function isValidRoomName(roomName) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(roomName);
}

async function getRoom(req, res) {
    const { roomName } = req.params;
    const uid = req.cookies.uid;
    if (!isValidRoomName(roomName)) {
        return res.status(400).send('Invalid room name');
    }

    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const user = userDoc.exists ? userDoc.data() : null;

    if (!user) {
        return res.status(400).send('User not found');
    }

    const db = await connectToDatabase(roomName);
    const messages = await db.collection('messages').find().toArray();
    res.render('room', { title: `Room: ${roomName}`, roomName, messages, user });
}

async function createRoom(req, res) {
    const { roomName } = req.body;
    if (!isValidRoomName(roomName)) {
        return res.status(400).send('Invalid room name');
    }
    const mainDb = await connectToDatabase('main');
    const roomExists = await mainDb.collection('rooms').findOne({ name: roomName });
    if (!roomExists) {
        await mainDb.collection('rooms').insertOne({ name: roomName });
    }
    res.redirect(`/${roomName}`);
}

async function searchMessages(req, res) {
    const { roomName } = req.params;
    const { query } = req.query;
    const uid = req.cookies.uid;

    if (!isValidRoomName(roomName)) {
        return res.status(400).send('Invalid room name');
    }

    const userDocRef = firestore.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    const user = userDoc.exists ? userDoc.data() : null;

    if (!user) {
        return res.status(400).send('User not found');
    }

    const db = await connectToDatabase(roomName);
    const searchResults = await db.collection('messages').find({ body: new RegExp(query, 'i') }).toArray();

    res.render('room', { title: `Room: ${roomName}`, roomName, messages: searchResults, user });
}

async function editMessage(req, res) {
    const { roomName, messageId } = req.params;
    const { newMessage } = req.body;
    const uid = req.cookies.uid;

    const db = await connectToDatabase(roomName);
    const message = await db.collection('messages').findOne({ _id: new ObjectId(messageId) });

    if (!message) {
        return res.status(404).send('Message not found');
    }

    console.log('Message userId:', message.userId);
    console.log('Current user UID:', uid);

    if (message.userId !== uid) {
        return res.status(403).send('You are not authorized to edit this message');
    }

    if (!newMessage.trim()) {
        await db.collection('messages').deleteOne({ _id: new ObjectId(messageId) });
    } else {
        await db.collection('messages').updateOne(
            { _id: new ObjectId(messageId) },
            { $set: { body: newMessage } }
        );
    }

    res.redirect(`/${roomName}`);
}

module.exports = { getRoom, createRoom, searchMessages, editMessage };

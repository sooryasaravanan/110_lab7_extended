const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const { body, validationResult } = require('express-validator');

const { homeHandler } = require('./controllers/home.js');
const { getRoom, createRoom, searchMessages, editMessage, fetchMessages } = require('./controllers/room.js'); 
const { loginHandler, renderLoginPage, createProfileHandler, renderCreateProfilePage } = require('./controllers/login.js');
const { connectToDatabase } = require('./db.js'); 
const { firestore } = require('./firebaseAdmin'); 

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    helpers: {
        escape: (text) => {
            if (typeof text !== 'string') {
                return text;
            }
            return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        }
    }
}));app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', renderLoginPage);
app.post('/login', loginHandler); 
app.get('/admin', async (req, res) => {
    const usersSnapshot = await firestore.collection('users').get();
    const users = usersSnapshot.docs.map(doc => doc.data());
    res.render('admin', { title: 'Admin Page', users });
});

app.post('/admin/delete-user', async (req, res) => {
    const { uid } = req.body;

    if (!uid || typeof uid !== 'string' || uid.trim() === '') {
        return res.status(400).send('Invalid user ID');
    }

    try {
        await firestore.collection('users').doc(uid).delete();
        res.redirect('/admin');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user');
    }
});


app.get('/create-profile', renderCreateProfilePage); 
app.post('/create-profile', 
    [
        body('displayName').trim().isLength({ min: 1 }).escape().withMessage('Display name is required.'),
        body('email').isEmail().normalizeEmail().withMessage('Email is not valid.')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render('create-profile', {
                title: 'Create Profile',
                errors: errors.array(),
                data: req.body
            });
        }

        const { displayName, email } = req.body;
        const userDocRef = firestore.collection('users').doc(req.body.uid);
        await userDocRef.set({
            displayName,
            email,
            uid: req.body.uid
        });

        if (email === 'sooryasarva@gmail.com') {
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }
    }
);

app.get('/home', homeHandler);
app.post('/logout', (req, res) => {
    res.clearCookie('uid');
    res.status(200).send('Logout successful');
});

app.get('/:roomName/search', async (req, res) => {
    const { roomName } = req.params;
    const { query } = req.query;

    const db = await connectToDatabase(roomName);
    const searchResults = await db.collection('messages').find({ body: new RegExp(query, 'i') }).toArray();

    res.render('room', {
        title: roomName,
        roomName,
        messages: searchResults,
        user: req.user
    });
});

app.get('/:roomName', getRoom);
app.post('/create', createRoom);
app.post('/:roomName/messages', async (req, res) => {
  const { roomName } = req.params;
  const { nickname, message } = req.body;
  const uid = req.cookies.uid;
  const datetime = new Date().toISOString();

  console.log('Creating message with UID:', uid); 

  const db = await connectToDatabase(roomName);
  await db.collection('messages').insertOne({ nickname, body: message, datetime, userId: uid });

  res.redirect(`/${roomName}`);
});

app.post('/:roomName/messages/:messageId/edit', editMessage);


app.get('/api/:roomName/messages', async (req, res) => {
    const { roomName } = req.params;
    const db = await connectToDatabase(roomName);
    const messages = await db.collection('messages').find().toArray();
    res.json(messages);
});


app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

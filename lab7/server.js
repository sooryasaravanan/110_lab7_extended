const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const path = require('path');
const { body, validationResult } = require('express-validator');

const { homeHandler } = require('./controllers/home.js');
const { getRoom, createRoom, searchMessages, editMessage } = require('./controllers/room.js'); // Import the editMessage function
const { loginHandler, renderLoginPage, createProfileHandler, renderCreateProfilePage } = require('./controllers/login.js');
const { connectToDatabase } = require('./db.js'); // Import the function
const { firestore } = require('./firebaseAdmin'); // Import the Firestore

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Redirect the root URL to the login page
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', renderLoginPage); // Add route to render login page
app.post('/login', loginHandler); // Add route to handle login

app.get('/create-profile', renderCreateProfilePage); // Add route to render create profile page
app.post('/create-profile', 
    // Validation and sanitization
    [
        body('displayName').trim().isLength({ min: 1 }).escape().withMessage('Display name is required.'),
        body('email').isEmail().normalizeEmail().withMessage('Email is not valid.')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, render the create-profile page with errors
            return res.status(400).render('create-profile', {
                title: 'Create Profile',
                errors: errors.array(),
                data: req.body
            });
        }

        const { uid, displayName, email } = req.body;

        try {
            // Add the user profile to Firebase Firestore
            await firestore.collection('users').doc(uid).set({
                displayName,
                email,
                createdAt: new Date()
            });

            res.redirect('/home');
        } catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).send('Error creating profile');
        }
    }
);
app.get('/home', homeHandler); // Route for home page after login
app.post('/logout', (req, res) => {
    res.clearCookie('uid');
    res.status(200).send('Logout successful');
});

// Route to handle search query
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
  const uid = req.cookies.uid; // Assuming the user UID is stored in a cookie after login
  const datetime = new Date().toISOString();

  console.log('Creating message with UID:', uid); // Debugging

  const db = await connectToDatabase(roomName);
  await db.collection('messages').insertOne({ nickname, body: message, datetime, userId: uid });

  res.redirect(`/${roomName}`);
});

// Add this route to handle editing messages
app.post('/:roomName/messages/:messageId/edit', editMessage);

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

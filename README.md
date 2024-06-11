# Chatroom Application

## Description

This is a chatroom application built with Node.js, Express, MongoDB, and Firebase for user authentication. Users can create profiles, join chatrooms, send messages, search messages within a chatroom, and edit or delete their own messages.

## Features

- User authentication with Google using Firebase
- Profile creation and validation
- Creating and joining chatrooms
- Sending and searching messages within chatrooms
- Editing or deleting messages by the message owner

## Prerequisites

- Node.js
- MongoDB
- Firebase Project

## Setup

1. **Clone the repository**

    ```git clone <repository-url>```
    ```cd <repository-directory>```

2. **Install dependencies**

    ```npm install```

3. **Set up MongoDB**

    Ensure MongoDB is installed and running on your machine. 

4. **Set up Firebase**

    - Go to the [Firebase Console]
    - Create a new project (or use an existing one).
    - Go to the Project Settings and add a new Web App.
    - Copy the Firebase configuration and replace the values in `firebase.js`.

5. **Service Account Key**

    - In the Firebase Console, go to Project Settings -> Service accounts.
    - Generate a new private key and save the JSON file in the project root as `serviceAccountKey.json`.

6. **Configure environment variables**

    Create a `.env` file in the project root and add the following environment variables:

    ```MONGODB_URI=<Your MongoDB URI>```

7. **Create necessary directories**

    Ensure the following directory structure is present:

    ```
    public/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── room.js
    │   └── create-profile.js
    │   └── firebase-auth.js
    views/
    ├── layouts/
    │   └── layout.hbs
    ├── create-profile.hbs
    ├── home.hbs
    ├── login.hbs
    └── room.hbs
    ```

## Running the Application

1. **Start the server**

    ```npm start```

    The server will start on `http://localhost:8080`.

## Usage

1. **Login**

    - Go to `http://localhost:8080/`.
    - Log in using Google Authentication.

2. **Create Profile**

    - If prompted, create your profile by providing a display name and email.

3. **Home Page**

    - From the home page, you can create new chatrooms or join existing ones.

4. **Chatroom**

    - Inside a chatroom, you can send messages, search for messages, and edit or delete your own messages.

## Validation and Sanitization

This application includes validation and sanitization to ensure data integrity and security. The following validations and sanitizations are implemented:

1. **Profile Creation:**

    - Display Name: Trimmed, minimum length of 1 character, escaped to prevent XSS attacks.
    - Email: Validated to ensure it is a properly formatted email, normalized to a consistent format.

    Example validation code:

    ```javascript
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
        }
    );
    ```

2. **Message Handling:**

    - Messages are trimmed to remove leading and trailing whitespace.
    - Messages are validated to ensure they are not empty.

    Example validation code for messages:

    ```javascript
    app.post('/:roomName/messages', 
        body('message').trim().isLength({ min: 1 }).withMessage('Message cannot be empty'), 
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).send('Message cannot be empty');
            }
        }
    );
    ```
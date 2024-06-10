const { connectToDatabase } = require('../db');

async function homeHandler(req, res) {
    const db = await connectToDatabase('main');
    const chatrooms = await db.collection('rooms').find().toArray();
    res.render('home', { title: 'Home', chatrooms });
}

module.exports = { homeHandler };

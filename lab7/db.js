const { MongoClient } = require('mongodb');

let client;

async function connectToDatabase(dbName) {
    if (!client) {
        client = new MongoClient('mongodb+srv://hirsch:chheda@cluster0.iojhpua.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
    }
    return client.db(dbName);
}

module.exports = { connectToDatabase };

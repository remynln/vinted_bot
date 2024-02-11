const { MongoClient } = require('mongodb');
const colors = require('colors');
const { mongo_url } = require('../config.json');
const client = new MongoClient(mongo_url);

let dbConnection;

module.exports = {
    connectToServer(callback) {
        console.log(`[DB] - [INFO] Connecting to MongoDB...`.yellow);
        client.connect().then(client => {
            console.log(`[DB] - [SUCCESS] Connected to MongoDB`.green);
            dbConnection = client;
            callback();
        }).catch(err => {
            console.error(`[DB] - [ERROR] Failed to connect to MongoDB`.red + err);
            callback(err);
        });
    },
    getDb() {
        return dbConnection;
    }
};
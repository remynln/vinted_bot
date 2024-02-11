const dbModule = require('../index');

module.exports = {
    saveToCache: async function (pollid, productid) {
        const collection = dbModule.getDb().db("cache").collection(pollid);
        const result = await collection.insertOne({ productid: productid });
    },
    isInCache: async function (pollid, productid) {
        const collection = dbModule.getDb().db("cache").collection(pollid);
        const result = await collection.findOne({ productid: productid });
        return result !== null;
    }
}
const dbModule = require('../index');
const db = dbModule.getDb();

module.exports = {
    haveAccess: async function (userid) {
        const collection = await dbModule.getDb().db('admins').collection('access')
        const user = await collection.findOne({ id: userid });
        if (user !== null) {
            return true;
        };
        return false;
    },
    getAccess: async function(userid) {
        const collection = await dbModule.getDb().db('admins').collection('access')
        const user = await collection.findOne({ id: userid });
        if (user !== null) {
            return user;
        };
        return null;
    },
    addAccess: async function (userid, expiration) {
        const collection = await dbModule.getDb().db('admins').collection('access')
        const user = await collection.findOne({ id: userid });
        const date = new Date();
        if (user === null) {
            await collection.insertOne({ id: userid, expiration: expiration, created_at: date});
            return true;
        }
        return false;
    },
    removeAccess: async function (userid) {
        const collection = await dbModule.getDb().db('admins').collection('access')
        const user = await collection.findOne({ id: userid });
        if (user !== null) {
            await collection.deleteOne({ id: userid });
            return true;
        }
        return false;
    }
}
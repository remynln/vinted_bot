const dbModule = require('../index');

module.exports = {
    isAdmin: async function (userid) {
        const collection = await dbModule.getDb().db('admins').collection('users')
        const user = await collection.findOne({ id: userid });
        return user !== null;
    },
    addAdmin: async function (userid) {
        const collection = await dbModule.getDb().db('admins').collection('users')
        const user = await collection.findOne({ id: userid });
        if (user === null) {
            await collection.insertOne({ id: userid });
            return true;
        }
        return false;
    },
    removeAdmin: async function (userid) {
        const collection = await dbModule.getDb().db('admins').collection('users')
        const user = await collection.findOne({ id: userid });
        if (user !== null) {
            await collection.deleteOne({ id: userid });
            return true;
        }
        return false;
    }
}
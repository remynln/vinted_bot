const dbModule = require('../index');

module.exports = {
    newPoll: async function (userid, name, url, api_url, interval, channelid, pollid, webhookid, webhooktoken) {
        const collection = await dbModule.getDb().db('polling').collection(userid)
        const poll = await collection.findOne({ name: name });
        if (poll === null) {
            await collection.insertOne({ name: name, url: url, api_url:api_url, interval: interval, channelid: channelid, pollid: pollid, webhookid: webhookid, webhooktoken:webhooktoken});
            return true;
        }
        return false
    },
    removePoll: async function (userid, name) {
        const collection = await dbModule.getDb().db('polling').collection(userid)
        const poll = await collection.findOne({ name: name });
        if (poll !== null) {
            await collection.deleteOne({ name: name });
            return true;
        }
        return false
    },
    removePollId: async function (userid, id) {
        const collection = await dbModule.getDb().db('polling').collection(userid)
        const poll = await collection.findOne({ pollid: id });
        if (poll !== null) {
            await collection.deleteOne({ pollid: id });
            return true;
        }
        return false
    },
    getPoll: async function (userid) {
        const collection = await dbModule.getDb().db('polling').collection(userid)
        const polls = await collection.find().toArray();
        return polls
    }
}
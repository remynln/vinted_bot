const db = require('./index');
require('./index').connectToServer((err) => {
    if (err) {
        console.error("[DB] - [WARNING] Failed to connect to database", err);
        return;
    }
});

async function init() {
    const client = await db.getDb();
    const admin_db = await client.db("admins")
    const admin_user_collection = await admin_db.createCollection("users")
    const admin_access_collection = await admin_db.createCollection("access")
    const polling_db = await client.db("polling")
    const cache_db = await client.db("cache")
}

init();
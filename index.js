const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require("./config.json");
const fs = require('fs');
const path = require('node:path');
const colors = require('colors');
const { newInterval, initMonitoring } = require('./monitoring/index')
const db = require('./db/index')

colors.enable();
const client = new Client({ intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
            console.log(`[BOT] - [SUCCESS] Loaded command ${command.data.name} from ${filePath}`.green)
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[BOT] - [WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`.red);
		}
	}
}


client.once(Events.ClientReady, readyClient => {
    console.log(`[BOT] - [SUCCESS] Logged in as ${readyClient.user.tag}`.blue);
	//load all the guilds
	readyClient.guilds.cache.forEach(guild => {
		console.log(`[BOT] - [SUCCESS] Loaded guild ${guild.name}`.yellow);
	});
	initMonitoring()
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!' });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!' });
		}
	}
});

db.connectToServer(async (err) => {
    if (err) {
        console.error("[DB] - [WARNING] Failed to connect to database", err);
        return;
    }
	console.log("[DB] - [SUCCESS] Loading intervals".yellow);
	const poll_db = await db.getDb().db("polling")
	const collections = await poll_db.listCollections().toArray();
    for (const collectionInfo of collections) {
      const collection = poll_db.collection(collectionInfo.name);
      console.log(`[DB] - [SUCCESS] Loaded collection ${collectionInfo.name}`.yellow);

      const documents = await collection.find().toArray();
      documents.forEach(document => {
		newInterval(document.pollid, document.api_url, document.channelid, document.interval, document.webhookid, document.webhooktoken, document.pollid);
        console.log(`[DB] - [SUCCESS] Loaded interval ${document.pollid}`.yellow);
      });
    }
	//drop db cache and recreate it
	console.log("[DB] - [SUCCESS] Dropping cache database".yellow);
	await db.getDb().db("cache").dropDatabase();
	console.log("[DB] - [SUCCESS] Creating cache database".yellow);
	await db.getDb().db("cache");
});

client.login(token);

module.exports = { client }
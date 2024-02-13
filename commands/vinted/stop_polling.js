const { SlashCommandBuilder, WebhookClient } = require('discord.js');
const access_db = require('../../db/admin/admin_access')
const polling_db = require('../../db/polling/polling')
const { removeInterval } = require('../../monitoring/index')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stoppolling')
    .setDescription('Stop to poll and search for new items on vinted')
    .addStringOption(option => {
        return option.setName('name')
        .setDescription('The name of the search')
        .setRequired(true);
    }),
    async execute(interaction) {
        const haveAccess = await access_db.haveAccess(interaction.user.id);
        if (!haveAccess) {
            await interaction.reply({ content: `You don't have accesss to the bot` });
            return;
        }
        const userid = interaction.user.id;
        const name = interaction.options.getString('name');
        const answer = await interaction.reply({ content: `Stopping polling for ${name}...`})
        const pollId = await polling_db.getPoll(userid).then(result => {
            if (result.length > 0) {
                const poll = result.find(poll => poll.name === name);
                if (poll) {
                    const wh = new WebhookClient({id: poll.webhookid, token: poll.webhooktoken})
                    wh.delete("Stopping poll");
                    return poll.pollid;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        })
        const result = await polling_db.removePoll(userid, name).then(result => {
            if (result) {
                removeInterval(pollId)
                return interaction.editReply({ content: `Stopped polling for ${name}`})
            } else {
                return interaction.editReply({ content: `Polling ${name} does not exists`})
            }
        })
    }
}
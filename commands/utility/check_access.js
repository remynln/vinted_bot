const { SlashCommandBuilder } = require('discord.js');
const access_db = require('../../db/admin/admin_access')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('checkaccess')
    .setDescription('Check your access to the bot'),
    async execute(interaction) {
        const haveAccess = await access_db.getAccess(interaction.user.id)
        if (haveAccess) {
            const date = new Date(haveAccess.expiration)
            await interaction.reply({ content: `You have access to the bot until ${date.toDateString()}` });
        } else {
            await interaction.reply({ content: `You don't have access to the bot` });
        }
    }
}
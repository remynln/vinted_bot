const { SlashCommandBuilder } = require('discord.js');
const admin_db = require('../../db/admin/admin_user')
const access_db = require('../../db/admin/admin_access')


module.exports = {
    data: new SlashCommandBuilder()
    .setName('access_add')
    .setDescription('Add user to the access list')
    .addMentionableOption(option => {
        return option.setName('user')
        .setDescription('The user you wish to add access to the bot')
        .setRequired(true);
    })
    .addNumberOption(option => {
        return option.setName('expiration')
        .setDescription('The number of days the user will have access to the bot')
        .setRequired(true)
        .setMinValue(1);
    }),
    async execute(interaction) {
        const canExecute = await admin_db.isAdmin(interaction.user.id)
        if (!canExecute) {
            await interaction.reply({ content: `You are not an admin` });
            return;
        }
        const user = interaction.options.getMentionable('user');
        const expiration = interaction.options.getNumber('expiration');
        let expirtationDate = new Date();
        expirtationDate.setDate(expirtationDate.getDate() + expiration);
        const answer = await interaction.reply({ content: `Adding ${user} access to the bot for ${expiration} days...`})
        const result = await access_db.addAccess(user.id, expirtationDate).then(result => {
            if (result) {
                return interaction.editReply({ content: `Added ${user} to the bot access until the ${expirtationDate.toDateString()}`});
            } else {
                return interaction.editReply({ content: `${user} already have access`});
            }
        });
    }
}
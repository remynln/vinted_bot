const { SlashCommandBuilder } = require('discord.js');
const admin_db = require('../../db/admin/admin_user')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('removeadmin')
    .setDescription('Remove user from the bot admins')
    .addMentionableOption(option => {
        return option.setName('user')
        .setDescription('The user to remove from the bot admins')
        .setRequired(true);
    }),
    async execute(interaction) {
        const canExecute = await admin_db.isAdmin(interaction.user.id);
        if (!canExecute) {
            await interaction.reply({ content: `You are not an admin` });
            return;
        }
        const user = interaction.options.getMentionable('user');
        const answer = await interaction.reply({ content: `Removing ${user} from the bot admins...`})
        const result = await admin_db.removeAdmin(user.id).then(result => {
            if (result) {
                return interaction.editReply({ content: `Removed ${user} to the bot admins`});
            } else {
                return interaction.editReply({ content: `${user} is not an admin`});
            }
        })
    }
}
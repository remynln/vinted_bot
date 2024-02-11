const { SlashCommandBuilder } = require('discord.js');
const admin_db = require('../../db/admin/admin_user')
const access_db = require('../../db/admin/admin_access')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('remove_acess')
    .setDescription('Remove user from the access list')
    .addMentionableOption(option => {
        return option.setName('user')
        .setDescription('The user you wish to remove from the access list')
        .setRequired(true);
    }),
    async execute(interaction) {
        const isAdmin = await admin_db.isAdmin(interaction.user.id);
        if (!isAdmin) {
            await interaction.reply({ content: `You are not an admin` });
            return;
        }
        const user = interaction.options.getMentionable('user');
        await interaction.reply({ content: `Removing ${user} from the bot access list...`})
        const result = await access_db.removeAccess(user.id).then(result => {
            if (result) {
                return interaction.editReply({ content: `Removed ${user} from the bot access list`});
            } else {
                return interaction.editReply({ content: `${user} is not in the access list`});
            }
        });
    }
}
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const access_db = require('../../db/admin/admin_access')
const polling_db = require('../../db/polling/polling')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('getpolling')
    .setDescription('Get your polling searches')
    .addStringOption(option => {
        return option.setName('name')
        .setDescription('The name of the search')
        .setRequired(false);
    }),
    async execute(interaction) {
        const haveAccess = await access_db.haveAccess(interaction.user.id);
        if (!haveAccess) {
            await interaction.reply({ content: `You don't have accesss to the bot` });
            return;
        }
        const answer = await interaction.reply({ content: `Getting your polling searches...`})
        if (interaction.options.getString('name')) {
            const name = interaction.options.getString('name');
            const userid = interaction.user.id;
            const answer = await interaction.editReply({ content: `Getting your polling search ${name}...`})
            const result = await polling_db.getPoll(userid).then(result => {
                if (result.length > 0) {
                    const poll = result.find(poll => poll.name === name);
                    if (poll) {
                        const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Your polling search')
                        .setTimestamp()
                        .setFooter({
                            text: 'Vinted Bot',
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        embed.addFields({
                            name: `${poll.name}`,
                            value: `id: ${poll.pollid} - interval: ${poll.interval} seconds - channel: <#${poll.channelid}>`
                        })
                        embed.addFields({
                            name: `Url`,
                            value: `${poll.url}`
                        })
                        return interaction.editReply({embeds: [embed], content: ""})
                    } else {
                        return interaction.editReply({ content: `You don't have any polling search with the name ${name}`})
                    }
                } else {
                    return interaction.editReply({ content: `You don't have any polling search`})
                }
            })
        } else {
            const userid = interaction.user.id;
            const result = await polling_db.getPoll(userid).then(result => {
                //create embed
                if (result.length > 0) {
                    const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Your polling searches')
                    .setTimestamp()
                    .setFooter({
                        text: 'Vinted Bot',
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    result.forEach(element => {
                        embed.addFields({
                            name: `${element.name}`,
                            value: `id: ${element.pollid} - interval: ${element.interval} seconds - channel: <#${element.channelid}>`
                        })
                    });
                    return interaction.editReply({embeds: [embed], content: ""})
                } else {
                    return interaction.editReply({ content: `You don't have any polling search`})
                }
            })
        }
    }
}
const { SlashCommandBuilder } = require('discord.js');
const access_db = require('../../db/admin/admin_access')
const polling_db = require('../../db/polling/polling')
const { newInterval } = require('../../monitoring/index');
const url = require('url');
const { webhook_pp } = require('../../config.json')

function transformVintedUrl(catalogUrl) {
    const api_url = "https://www.vinted.fr/api/v2/catalog/items";

    const parsedUrl = url.parse(catalogUrl, true);
    const query = parsedUrl.query;
    const queryParameters = {
        page: 1,
        per_page: 50,
        search_text: query.search_text || null,
        catalog_ids: query["catalog[]"] ? query["catalog[]"].toString() : null,
        currency: query.currency || null,
        order: query.order || null,
        status_ids: query["status_ids[]"] ? query["status_ids[]"].toString() : null,
        size_ids: query["size_ids[]"] ? query["size_ids[]"].toString() : null,
        brand_ids: query["brand_ids[]"] ? query["brand_ids[]"].toString() : null,
        color_ids: query["color_ids[]"] ? query["color_ids[]"].toString() : null,
        material_ids: query["material_ids[]"] ? query["material_ids[]"].toString() : null,
        price_from: query.price_from || null,
        price_to: query.price_to || null,
    }
    //add the query parameters to the api url except the null ones
    const apiUrl = `${api_url}?${Object.keys(queryParameters).filter(key => queryParameters[key] !== null).map(key => `${key}=${queryParameters[key]}`).join('&')}`;
    console.log(apiUrl);
    return apiUrl;
}

function generateId() {
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 1000);
    return `${timestamp.toString().slice(-3)}${randomComponent}`;
}


module.exports = {
    data: new SlashCommandBuilder()
    .setName('startpolling')
    .setDescription('Start to poll and search for new items on vinted')
    .addStringOption(option => {
        return option.setName('name')
        .setDescription('The name of the search')
        .setRequired(true);
    })
    .addStringOption(option => {
        return option.setName('url')
        .setDescription('The url to start polling')
        .setRequired(true);
    })
    .addNumberOption(option => {
        return option.setName('interval')
        .setDescription('The interval to search for new items in seconds (default 300)')
    }),
    async execute(interaction) {
        const haveAccess = await access_db.haveAccess(interaction.user.id);
        if (!haveAccess) {
            await interaction.reply({ content: `You don't have accesss to the bot` });
            return;
        }
        const userid = interaction.user.id;
        const name = interaction.options.getString('name');
        const url = interaction.options.getString('url');
        const interval = interaction.options.getNumber('interval') || 60;
        const answer = await interaction.reply({ content: `Starting polling for ${name}...`})
        let api_url = transformVintedUrl(url);
        const id = generateId();
        let wh = {id: "", token: ""}
        const webhook = await interaction.channel.createWebhook({
            name: name,
            avatar: webhook_pp,
        }).then((webhook) => {
            wh.id = webhook.id
            wh.token = webhook.token
        })
        .catch(console.error);
        const result = await polling_db.newPoll(userid, name, url, api_url, interval, interaction.channel.id, id, wh.id, wh.token).then(result => {
            if (result) {
                newInterval(id, api_url, interaction.channel.id, interval, wh.id, wh.token, id);
                return interaction.editReply({ content: `Started polling for ${name}`})
            } else {
                return interaction.editReply({ content: `Error starting polling for ${name}`})
            }
        })
    }
}
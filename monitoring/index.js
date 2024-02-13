const { ActionRowBuilder, WebhookClient, EmbedBuilder, ButtonBuilder } = require('discord.js')
const cloudscraper = require('cloudscraper').defaults({proxy: "20.111.54.16:8123"})
const axios = require('axios');
const cachedb = require('../db/cache/index')

var myIntervals={};
var options = {
    method: 'GET',
    url: 'https://vinted.fr/',
    headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0"
    }
}

async function sendNewProduct(wh, item) {
    let embeds = []
    const embed = new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setColor(0x00FF00)
    .setTimestamp()
    .setImage(item.photo.url)
    .addFields({
        name: `**Marque**`,
        value: `${item.brand_title}`,
        inline: true
    },
        {
            name: `**Taille**`,
        value: `${item.size_title}`,
        inline: true
    },
    {
        name: `Avis`,
        value: `WIP`,
        inline: true
    },
    {
        name: `Etat`,
        value: `${item.status}`,
        inline: true
    },
    {
        name: `Prix`,
        value: `${item.price}€ + ${item.service_fee}€ = **${parseInt(item.price) + parseInt(item.service_fee)}€**`,
        inline: true
    })
    const openButton = new ButtonBuilder()
        .setLabel('Voir l\'article')
        .setStyle('Link')
        .setURL(item.url)
    
    // const buyButton = new ButtonBuilder()
    //     .setLabel('Acheter')
    //     .setStyle('PRIMARY')
    //     .setURL(item.url)

    let row = new ActionRowBuilder().addComponents(openButton)
    embeds.push(embed)
    await wh.send({embeds: embeds, components: [row]})
}


async function pollAPI(api_url, channel_id, interval, webhookid, webhooktoken, pollid) {
    console.log(`Polling ${api_url} every ${interval} seconds on ${channel_id}...`);
    const wh = new WebhookClient({id: webhookid, token:webhooktoken})

    options.url = api_url
    cloudscraper(options)
    .then(async (res) => {
        const r = JSON.parse(res)
        const isEmpty = await cachedb.isEmpty(pollid)
        if (isEmpty) {
            r["items"].forEach(async (item) => {
                await cachedb.saveToCache(pollid, item.id)
            })
            return
        }
        r["items"].forEach(async (item) => {
            if (await cachedb.isInCache(pollid, item.id)) {
            } else {
                await cachedb.saveToCache(pollid, item.id)
                await sendNewProduct(wh, item)
            }
        })
        
    })
    .catch((err) => {
        wh.send("Something went wrong look at the console")
        console.log(err)
    })
}

module.exports = {
    initMonitoring() {
        console.log("[MON] - [INFO] Refreshed vinted cookie sessions")
        cloudscraper(options)
        setInterval(() => {
            console.log("[MON] - [INFO] Refreshed vinted cookie sessions")
            cloudscraper(options)
        }, 60 * 1000)
    },
    getIntervalStatus() {
        return ("aaa")
    },
    newInterval(id, api_url, channel, interval, webhookid, webhooktoken, pollid) {
        myIntervals[id] = setInterval(() => {
            pollAPI(api_url, channel, interval, webhookid, webhooktoken, pollid);
        }, interval * 1000);
    },
    removeInterval(id) {
        console.log(`Removing interval ${id}`);
        clearInterval(myIntervals[id]);
    }
}

const fetch = require('fetch');
var myIntervals={};

async function pollAPI(api_url, channel, interval) {
    console.log(`Polling ${api_url} every ${interval} seconds on ${channel}...`);
    // Poll the vinted API on the url
    // If there are new items, send a message to the channel
    // If there are no new items, do nothing
    // If there is an error, log it

    const response = await fetch(api_url);
    const data = await response.json();
    console.log(data);
}

module.exports = {
    newInterval(id, api_url, channel, interval) {
        myIntervals[id] = setInterval(() => {
            pollAPI(api_url, channel, interval);
        }, interval * 1000);
    },
    removeInterval(id) {
        console.log(`Removing interval ${id}`);
        clearInterval(myIntervals[id]);
    }
}

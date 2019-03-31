const discordjs = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

let spamMode = false;

let sleep = function(ms) {
    return new Promise(resolve=> {
        setTimeout(resolve, ms);
    });
}

let getPageContent = async function (url) {
    const data = await axios.get(url);
    return data.data;
}

let getImageUrl = async function (html) {
    const $ = cheerio.load(html);
    const url = $('div.image-container').find('img').attr('src');
    if (url === undefined || url.includes("//st.")) {
        return undefined;
    } else {
        return url;
    }
}

let chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
let getRandomUrl = function () {
    let url = "";
    for (let i = 0; i < 6; i++) {
        url += chars[Math.floor(Math.random() * chars.length)];
    }
    return url;
}

let getPrntScRandom = async function (msg, responseMsg, i) {
    let url = `https://prnt.sc/${getRandomUrl()}`;
    let html = await getPageContent(url);
    let imageUrl = await getImageUrl(html);

    if (imageUrl === undefined) {
        if(responseMsg !== undefined){
            responseMsg
            .then(r => r.edit("That screenshot doesn't exist, searching a different one"))
            .catch(error => {
                console.error(`getPrntScRandom 1 | ${error}`);
            });
        }
        getPrntScRandom(msg, responseMsg, i)
    } else {
        msg.channel.send(`${url} | ${i}`);
        if(responseMsg !== undefined){
            responseMsg
            .then(r => r.delete())
            .catch(error => {
                console.error(`getPrntScRandom 2 | ${error}`);
            });
        }
    }
}

let spamPrntSc = async function(msg){
    for(let i = 0; i < 100; i++){
        getPrntScRandom(msg, undefined, i);
        await sleep(5000);
    }
    spamMode = false;
}

let getPrntScId = async function (msg, id, responseMsg) {
    let url = `https://prnt.sc/${id}`;
    let html = await getPageContent(url);
    let imageUrl = await getImageUrl(html);

    if (imageUrl === undefined) {
        responseMsg
            .then(r => r.edit(`Screenshot "${id}" does not exist...`))
            .catch(error => {
                console.error(`getPrntScId 1 | ${error}`);
            });;
    } else {
        msg.channel.send(url);
        responseMsg
            .then(r => r.delete())
            .catch(error => {
                console.error(`getPrntScId 2 | ${error}`);
            });;
    }
}

module.exports.run = async (bot, msg, args) => {
    let guild = msg.channel.guild;
    let scrapesChannel = await guild.channels.find(channel => channel.name === 'prntsc');
    if (scrapesChannel === null) {
        guild.createChannel("prntsc", "text");
    }
    if (args.length < 1 || args.length > 2) return msg.channel.send(`Invalid arguments, use ${process.env.BOT_PREFIX}help for command usage`);

    let responseMsg = msg.channel.send("Getting prntsc...");

    if(spamMode){
        responseMsg.then(r => r.delete(5000));
        return msg.channel.send("Wait for spam mode to be complete")
            .then(r => r.delete(5000))
            .catch(error => {
                console.error(`module.exports.run 1 | ${error}`);
            });
    }

    if (args[0].toLowerCase() === "r") {
        getPrntScRandom(msg, responseMsg, 0);
    }else if(args[0].toLowerCase() === "s"){
        spamMode = true;
        spamPrntSc(msg, responseMsg);
    } else {
        getPrntScId(msg, args[0], responseMsg);
    }
}

module.exports.help = {
    "name": "scrape",
    "desc": "Get random prtsc images, or start at a certain input",
    "usage": "\n- scrape r (Get a single random image)\n - scrape <id> (Get prntsc with by id)\n - scrape s (Enters spam mode => gets 100 random images)"
}
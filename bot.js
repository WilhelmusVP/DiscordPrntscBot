if(process.env.NODE_ENV !== 'production'){
	require('dotenv').config();
}
const Discord = require('discord.js');
const bot = new Discord.Client({disableEveryone: true});
const fs = require('fs');

bot.commands = new Discord.Collection();
fs.readdir("./commands/", (err, data) =>{
    if(err) console.log(err);
    let files = data.filter(file => file.split(".").pop() === "js");
    if(files.length <= 0){
        return;
    }
    files.forEach((file, index) => {
        let exports = require(`./commands/${file}`);
        bot.commands.set(exports.help.name, exports);
    });
    console.log(`Loaded ${files.length} commands!`);
});

bot.on('ready', () => {
    bot.user.setActivity(`${process.env.BOT_PREFIX}`)
    .catch(console.error);
    console.log("Bot loaded!");
});

var rateLimit = {};

bot.on('message', msg => {
    if(msg.author.id === bot.user.id) return;
    if(msg.channel.type === "dm") return;

    let prefix = process.env.BOT_PREFIX;
    let content = msg.content.split(" ");
    let cmd = content[0];
    let args = content.slice(1);

    if(content[0].slice(0, prefix.length).toLocaleLowerCase() !== prefix) return;

    let command = bot.commands.get(cmd.slice(prefix.length));
    if(command){
        if(!process.env.BOT_OWNER_ID.split(",").includes(msg.author.id)){
            msg.channel.send("You aren't cool enough to use this bot :smiling_imp:")
            .then(msg => {msg.delete(5000)});
            return;
        }

        if(rateLimit[msg.author.id]){
            var time = rateLimit[msg.author.id];
            var now = new Date().getTime();
            var difference = now - time;
            if(difference < 0){
                msg.channel.send(`You are on timeout for another ${Math.round(-difference/1000,1)} seconds`).then(r => r.delete(1000));
                msg.delete();
                return;
            }
        }
        rateLimit[msg.author.id] = new Date().getTime() + (1000 * 5);
        command.run(bot, msg, args);
    }
});

bot.on('error', (err) => {
    console.log(`DiscordJS error: ${err}`);
});

bot.login(process.env.BOT_TOKEN);
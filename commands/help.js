const discordjs = require('discord.js');

module.exports.run = async (bot, msg, args) => {

    let serverEmbed = new discordjs.RichEmbed()
        .setDescription(`**PrntSc scraper - Command List**`)
        .setColor("#77f442")
        .addBlankField();

    bot.commands.forEach(element => {
        let str = "";
        if (element.help.desc) {
            str += ("Description: _" + element.help.desc + "_");
        }
        if (element.help.usage) {
            str += ("\nUsage: _" + element.help.usage + "_");
        }
        if (!str.length == 0) {
            serverEmbed.addField(`${element.help.name}`, str);
        }
    });

    msg.delete();
    msg.channel.send(serverEmbed);
}

module.exports.help = {
    "name": "help"
}
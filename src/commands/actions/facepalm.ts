import { Client, Message, MessageEmbed } from 'discord.js'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    const embed = new MessageEmbed();
    embed.setColor('#F2DEB0')
    embed.setDescription(`**<@${msg.author.id}>**, facepalm!`)
    embed.setImage('https://i.imgur.com/zqUDpIk.gif');

    return msg.channel.send(embed)
        .then(() => {
            log.info({msg: 'facepalm', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
        })
        .catch(log.error);
};

module.exports.help = {
    name: 'facepalm',
    usage: "facepalm",
    desc: "Do a facepalm",
    perms: ['EMBED_LINKS']
};
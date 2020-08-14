import { Client, Message } from 'discord.js';
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    await msg.channel.send({
        "embed": {
          "title": "You can invite me to your server through this link:",
          "description": "https://kwako.iwa.sh/",
          "color": 16774804}
        })
        .then(() => { log.info({msg: 'invite', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id}) })
        .catch(log.error);
};

module.exports.help = {
    name: 'invite',
    usage: "invite",
    desc: "This will send you a link to add me into your server!",
    perms: ['EMBED_LINKS']
};
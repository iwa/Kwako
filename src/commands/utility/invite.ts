import Kwako from '../../Client'
import { Message } from 'discord.js';

module.exports.run = async (msg: Message) => {
    await msg.channel.send({
        "embed": {
          "title": "You can invite me to your server through this link:",
          "description": "https://kwako.iwa.sh/",
          "color": 16774804}
        })
        .then(() => { Kwako.log.info({msg: 'invite', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }}) })
        .catch(Kwako.log.error);
};

module.exports.help = {
    name: 'invite',
    usage: "invite",
    desc: "This will send you a link to add me into your server!",
    perms: ['EMBED_LINKS']
};
import Kwako from '../../Client'
import { Message } from 'discord.js';

module.exports.run = async (msg: Message) => {
    let ping = Math.ceil(Kwako.ws.ping)
    await msg.channel.send(`:ping_pong: Ping ! \`${ping}ms\``)
        .then(() => { Kwako.log.info({msg: 'ping', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }}) })
        .catch(Kwako.log.error);
};

module.exports.help = {
    name: 'pong',
    usage: "pong",
    desc: "Get response time between Kwako and Discord servers.",
    perms: ['EMBED_LINKS']
};
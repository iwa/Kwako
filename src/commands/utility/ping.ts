import Kwako from '../../Client'
import { Message } from 'discord.js';

module.exports.run = async (msg: Message) => {
    let ping = Math.ceil(Kwako.ws.ping)
    await msg.channel.send(`:ping_pong: Pong ! \`${ping}ms\``)
        .then(() => { Kwako.log.info({msg: 'ping', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }}) })
        .catch(err => Kwako.log.error(err));
};

module.exports.help = {
    name: 'ping',
    usage: "ping",
    desc: "Get response time between Kwako and Discord servers.",
    perms: ['EMBED_LINKS']
};
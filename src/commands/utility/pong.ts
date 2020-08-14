import { Client, Message } from 'discord.js';
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    let ping = Math.ceil(bot.ws.ping)
    await msg.channel.send(`:ping_pong: Ping ! \`${ping}ms\``)
        .then(() => { log.info({msg: 'ping', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id}) })
        .catch(log.error);
};

module.exports.help = {
    name: 'pong',
    usage: "pong",
    desc: "Get response time between Kwako and Discord servers.",
    perms: ['EMBED_LINKS']
};
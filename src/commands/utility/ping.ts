import { Client, Message } from 'discord.js';

module.exports.run = async (bot: Client, msg: Message) => {
    let ping = Math.ceil(bot.ws.ping)
    await msg.channel.send(`:ping_pong: Pong ! \`${ping}ms\``)
        .then(() => { console.log(`info: ping: ${msg.author.tag}`) })
        .catch(console.error);
};

module.exports.help = {
    name: 'ping',
    usage: "ping",
    desc: "Get response time between Kwako and Discord servers."
};
import { Client, Message } from 'discord.js';

module.exports.run = async (bot: Client, msg: Message) => {
    let ping = Math.ceil(bot.ws.ping)
    await msg.channel.send(`:ping_pong: Pong ! \`${ping}ms\``)
        .then(() => { console.log(`info: ping: ${msg.author.tag}`) })
        .catch(console.error);
};

module.exports.help = {
    name: 'ping',
    usage: "?ping",
    desc: "This will send you the ping between Q-Bot and Discord's Servers"
};
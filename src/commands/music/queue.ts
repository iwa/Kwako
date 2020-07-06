import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    music.list(msg, args);
};

module.exports.help = {
    name: 'queue',
    usage: "queue",
    desc: "Show the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
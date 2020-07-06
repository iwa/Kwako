import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.clear(msg);
};

module.exports.help = {
    name: 'clear',
    usage: "clear",
    desc: "Clear the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
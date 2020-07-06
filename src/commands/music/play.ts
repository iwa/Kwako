import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    music.play(bot, msg, args);
};

module.exports.help = {
    name: 'play',
    usage: "play (YouTube link | keywords)",
    desc: "Play YouTube videos in a voice channel",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
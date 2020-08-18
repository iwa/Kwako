import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.np(msg);
};

module.exports.help = {
    name: 'nowplaying',
    aliases: ['np'],
    usage: "nowplaying",
    desc: "Show the currently playing song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
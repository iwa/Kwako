import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message) => {
    music.np(msg, bot);
};

module.exports.help = {
    name: 'nowplaying',
    aliases: ['np'],
    usage: "nowplaying",
    desc: "Show the currently playing song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
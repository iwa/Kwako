import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.np(msg, bot, log);
};

module.exports.help = {
    name: 'nowplaying',
    aliases: ['np'],
    usage: "nowplaying",
    desc: "Show the currently playing song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
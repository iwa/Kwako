import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.loopqueue(msg, log);
};

module.exports.help = {
    name: 'loopqueue',
    aliases: ['loopq'],
    usage: "loopqueue",
    desc: "Enable / Disable loop for the current queue.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
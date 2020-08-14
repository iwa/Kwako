import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.loop(msg, log);
};

module.exports.help = {
    name: 'loop',
    usage: "loop",
    desc: "Enable / Disable loop for the current song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
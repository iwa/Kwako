import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.list(msg, log);
};

module.exports.help = {
    name: 'queue',
    aliases: ['q'],
    usage: "queue",
    desc: "Show the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
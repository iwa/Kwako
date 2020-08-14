import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.resume(bot, msg, log);
};

module.exports.help = {
    name: 'resume',
    usage: "resume",
    desc: "Resume paused music",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
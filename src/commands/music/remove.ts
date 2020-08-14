import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: string[], db: any, log: Logger) => {
    music.remove(msg, args, log);
};

module.exports.help = {
    name: 'remove',
    usage: "remove (id of the video in the queue)",
    desc: "Remove a video in the queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
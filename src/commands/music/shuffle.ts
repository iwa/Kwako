import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.shuffle(bot, msg, log);
};

module.exports.help = {
    name: 'shuffle',
    usage: "shuffle",
    desc: "Shuffle the current queue.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
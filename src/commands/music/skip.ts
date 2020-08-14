import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    music.skip(bot, msg, log);
};

module.exports.help = {
    name: 'skip',
    aliases: ['next'],
    usage: "skip",
    desc: "Vote to skip the current played song\nThe half of the people in the voice channel needs to voteskip for skipping the song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
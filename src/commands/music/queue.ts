import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    music.list(msg, args);
};

module.exports.help = {
    name: 'queue',
    aliases: ['q'],
    usage: "queue",
    desc: "Show the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
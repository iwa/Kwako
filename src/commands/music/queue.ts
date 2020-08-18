import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.list(msg);
};

module.exports.help = {
    name: 'queue',
    aliases: ['q'],
    usage: "queue",
    desc: "Show the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
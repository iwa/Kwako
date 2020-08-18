import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.loop(msg);
};

module.exports.help = {
    name: 'loop',
    usage: "loop",
    desc: "Enable / Disable loop for the current song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
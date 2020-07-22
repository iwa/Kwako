import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message) => {
    music.loopqueue(msg);
};

module.exports.help = {
    name: 'loopqueue',
    aliases: ['loopq'],
    usage: "loopqueue",
    desc: "Enable / Disable loop for the current queue.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
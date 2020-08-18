import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.pause(msg);
};

module.exports.help = {
    name: 'pause',
    usage: "pause",
    desc: "Pause the currently played song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
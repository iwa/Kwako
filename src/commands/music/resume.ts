import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.resume(msg);
};

module.exports.help = {
    name: 'resume',
    usage: "resume",
    desc: "Resume paused music",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message) => {
    music.resume(bot, msg);
};

module.exports.help = {
    name: 'resume',
    usage: "resume",
    desc: "Resume paused music",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
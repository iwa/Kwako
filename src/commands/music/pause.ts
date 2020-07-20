import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message) => {
    music.pause(bot, msg);
};

module.exports.help = {
    name: 'pause',
    usage: "pause",
    desc: "Pause the currently played song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
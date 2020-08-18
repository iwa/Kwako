import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.stop(msg);
};

module.exports.help = {
    name: 'stop',
    aliases: ['leave'],
    usage: "stop",
    desc: "Make the bot stop playing music and disconnect it from",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message) => {
    music.shuffle(bot, msg);
};

module.exports.help = {
    name: 'shuffle',
    usage: "shuffle",
    desc: "Shuffle the current queue.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
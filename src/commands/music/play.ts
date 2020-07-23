import { Client, Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    music.play(bot, msg, args);
};

module.exports.help = {
    name: 'play',
    aliases: ['add'],
    usage: "play (YouTube link | keywords)",
    desc: "Play YouTube videos in a voice channel",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
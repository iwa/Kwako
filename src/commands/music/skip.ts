import { Message } from 'discord.js'
import music from '../../utils/music'

module.exports.run = (msg: Message) => {
    music.skip(msg);
};

module.exports.help = {
    name: 'skip',
    aliases: ['next'],
    usage: "skip",
    desc: "Vote to skip the current played song\nThe half of the people in the voice channel needs to voteskip for skipping the song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
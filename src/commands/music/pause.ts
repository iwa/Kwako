import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message) => {
    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.playing && !player.paused) {
        player.pause(true);
        await msg.react('✅');
        Kwako.log.info({msg: 'pause', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
    }
};

module.exports.help = {
    name: 'pause',
    usage: "pause",
    desc: "Pause the currently played song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
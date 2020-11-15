import Kwako from '../../Client'
import { Message, MessageEmbed, VoiceChannel } from 'discord.js'

module.exports.run = (msg: Message) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    let voiceChannel: VoiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return;

    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if (!player.playing && player.queue.length === 0) {
        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle("I'm not playing anything right now!")
        return msg.channel.send(embed);
    }

    const embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor("Forced skip...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
    msg.channel.send(embed)

    player.setTrackRepeat(false);
    player.stop();

    return Kwako.log.info({msg: 'forceskip', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'forceskip',
    aliases: ['fs'],
    usage: 'forceskip',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD']
};
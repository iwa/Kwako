import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = (msg: Message) => {
    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.voiceChannel !== msg.member.voice.channelID) return msg.channel.send({'embed':{
        'title': ':x: You need to be connected in the same voice channel as me to use this command'
    }});

    let loop = player.trackRepeat || false;

    if (!loop) {
        player.setTrackRepeat(true);

        Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: true})
        const embed = new MessageEmbed()
            .setAuthor("🔂 Looping the current song...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setColor('GREEN')

        return msg.channel.send(embed)
    } else if (loop) {
        player.setTrackRepeat(false);

        Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: false})
        const embed = new MessageEmbed()
            .setAuthor("This song will no longer be looped...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setColor('GREEN')

        return msg.channel.send(embed)
    }
};

module.exports.help = {
    name: 'loop',
    usage: "loop",
    desc: "Enable / Disable loop for the current song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
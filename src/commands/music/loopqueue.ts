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

    let loop = player.queueRepeat || false;

    if (!loop) {
        player.setQueueRepeat(true);

        Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: true})
        const embed = new MessageEmbed()
            .setAuthor("🔁 Looping the queue...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setColor('GREEN')

        return msg.channel.send(embed)
    } else if (loop) {
        player.setQueueRepeat(false);

        Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: false})
        const embed = new MessageEmbed()
            .setAuthor("The queue will no longer be looped...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setColor('GREEN')

        return msg.channel.send(embed)
    }
};

module.exports.help = {
    name: 'loopqueue',
    aliases: ['loopq'],
    usage: "loopqueue",
    desc: "Enable / Disable loop for the current queue.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
import Kwako from '../../Client'
import { Message, MessageEmbed, Util } from 'discord.js'

module.exports.run = (msg: Message) => {
    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.voiceChannel !== msg.member.voice.channelID) return msg.channel.send({'embed':{
        'title': ':x: You need to be connected in the same voice channel as me to use this command'
    }});

    if (!player.playing && player.queue.length === 0) {
        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle("I'm not playing anything right now!")
        return msg.channel.send(embed);
    }

    let song = player.queue['current'];

    const embed = new MessageEmbed();
    embed.setColor('GREEN')
    embed.setTitle("**:cd: Now Playing:**")

    let desc = `[${Util.escapeMarkdown(song.title)}](${song.uri})`;

    if(!song.isStream) {
        let loo = player.trackRepeat || false
        if (loo) desc += "\n🔂 Currently looping this song - type `?loop` to disable";

        let looqueue = player.queueRepeat || false
        if (looqueue) desc += "\n🔁 Currently looping the queue - type `?loopqueue` to disable";

        embed.setDescription(desc)

        let songDuration = new Date(song.duration).toISOString().substr(11, 8);
        let time = new Date(player.position).toISOString().slice(11, 19)
        embed.setFooter(`${time} / ${songDuration}`)
    } else
        embed.setFooter('🔴 Listening to a stream | Skip to stop the stream')

    embed.setThumbnail(song.thumbnail)

    msg.channel.send(embed)
    Kwako.log.info({msg: 'nowplaying', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'nowplaying',
    aliases: ['np'],
    usage: "nowplaying",
    desc: "Show the currently playing song.",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
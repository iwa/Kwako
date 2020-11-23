import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = (msg: Message, args: string[]) => {
    if (!msg.member.voice.channel) return;
    if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.member.voice.channel.members.size !== 2) return;

    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.voiceChannel !== msg.member.voice.channelID) return msg.channel.send({'embed':{
        'title': ':x: You need to be connected in the same voice channel as me to use this command'
    }});

    let queueID: number = parseInt(args[0], 10);

    if (isNaN(queueID)) return;
    if (queueID < 1) return;

    let song = player.queue.splice(queueID, 1);

    if (!song[0]) return;

    const embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor('Removed from the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
        .setDescription(`**${song[0].title}**`)
        .setFooter(`Removed by ${msg.author.username}`);

    msg.channel.send(embed)

    Kwako.log.info({msg: 'remove', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, song: { title: song[0].title, url: song[0].uri }});
};

module.exports.help = {
    name: 'remove',
    usage: "remove (id of the video in the queue)",
    desc: "Remove a video in the queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};
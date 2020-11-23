import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if(args.length !== 1) return;

    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.voiceChannel !== msg.member.voice.channelID) return msg.channel.send({'embed':{
        'title': ':x: You need to be connected in the same voice channel as me to use this command'
    }});

    if(player.playing) {
        let current = player.position;
        player.seek(current + (parseInt(args[0], 10) * 1000))
        await msg.react('✅');
    }

    Kwako.log.info({msg: 'clear', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'fastforward',
    aliases: ['ff'],
    usage: "fastforward (number in seconds)",
    desc: "Fast forward the music with a certain number of seconds",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
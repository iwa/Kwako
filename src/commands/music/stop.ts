import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message) => {
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

    player.destroy();

    await msg.react('✅');
    Kwako.log.info({msg: 'stop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'stop',
    aliases: ['leave', 'disconnect', 'dc'],
    usage: "stop",
    desc: "Make the bot stop playing music and disconnect it from",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};
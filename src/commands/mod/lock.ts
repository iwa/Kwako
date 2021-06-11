import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

module.exports.run = async (msg: Message) => {
    if (!msg.member.hasPermission('MANAGE_CHANNELS')) return;

    await (msg.channel as TextChannel).updateOverwrite(msg.guild.roles.everyone, {
        'SEND_MESSAGES': false,
        'ADD_REACTIONS': false
    });

    await (msg.channel as TextChannel).updateOverwrite(Kwako.user.id, {
        'SEND_MESSAGES': true,
        'ADD_REACTIONS': true,
        'MANAGE_CHANNELS': true
    });

    const embed = new MessageEmbed();
    embed.setColor('RED')
    embed.setTitle(`🔒 The channel has been locked by **${msg.author.username}**`)

    try {
        await msg.channel.send(embed);
        Kwako.log.info({msg: 'lock', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, channel: msg.channel.id})
    } catch (err) {
        Kwako.log.error(err);
    }
};

module.exports.help = {
    name: 'lock',
    usage: 'lock',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_CHANNELS']
}
import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

module.exports.run = async (msg: Message) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    (msg.channel as TextChannel).permissionOverwrites.forEach(async (value) => {
        await value.update({
            'SEND_MESSAGES': null,
            'ADD_REACTIONS': null
        });
    })

    const embed = new MessageEmbed();
    embed.setColor('RED')
    embed.setTitle(`🔒 The channel has been locked by **${msg.author.username}**`)

    try {
        await msg.channel.send(embed);
        Kwako.log.info({msg: 'unlock', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, channel: msg.channel.id})
    } catch (err) {
        Kwako.log.error(err);
    }
};

module.exports.help = {
    name: 'unlock',
    usage: 'ban (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'BAN_MEMBERS']
}
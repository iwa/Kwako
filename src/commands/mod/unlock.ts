import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA && process.env.SUDO === '0')) return;

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
        log.info({msg: 'unlock', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id, channel: msg.channel.id})
    } catch (err) {
        log.error(err);
    }
};

module.exports.help = {
    name: 'unlock',
    usage: 'ban (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'BAN_MEMBERS']
}
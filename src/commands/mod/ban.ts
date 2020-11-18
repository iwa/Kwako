import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = async (msg: Message, args:string[]) => {
    if (!msg.member.hasPermission('BAN_MEMBERS')) return;

    if (args.length >= 2 && msg.channel.type != 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === msg.author.id || mention.id === Kwako.user.id) return;

        try {
            await msg.delete();
        } catch (error) {
            Kwako.log.error(error);
        }

        args.shift();
        let reason = "no reason provided";
        if(args.length > 1)
            reason = args.join(" ")

        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle(`🔨 **${mention.user.username}** has been banned by **${msg.author.username}**`)

        try {
            await mention.ban({ days: 7, reason: reason });
            await msg.channel.send(embed);
        } catch (err) {
            await msg.channel.send("I can't ban this person!")
        }

        Kwako.log.info({msg: 'ban', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.user.tag, reason: reason }});
    }
};

module.exports.help = {
    name: 'ban',
    usage: 'ban (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'BAN_MEMBERS']
}
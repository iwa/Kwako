import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = async (msg: Message, args:string[]) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    if (args.length >= 1 && msg.channel.type != 'dm') {
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
        embed.setTitle(`🚪 **${mention.user.username}** has been kicked by **${msg.author.username}**`)

        try {
            await mention.kick(reason);
            await msg.channel.send(embed);
        } catch (err) {
            await msg.channel.send("I can't kick this person!")
        }

        Kwako.log.info({msg: 'setconf', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.user.tag, reason: reason }})
    }
};

module.exports.help = {
    name: 'kick',
    usage: 'kick (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'KICK_MEMBERS']
}
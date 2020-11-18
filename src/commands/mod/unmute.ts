import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    if (args.length === 1 && msg.channel.type != 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === msg.author.id || mention.id === Kwako.user.id) return;

        try {
            await msg.delete();
        } catch (error) {
            Kwako.log.error(error);
        }

        const embed = new MessageEmbed();
        embed.setColor(14349246)
        embed.setTitle(`✅ **${mention.user.username}** has been unmuted`)

        try {
            await mention.roles.remove(guildConf.muteRole);
            await Kwako.db.collection('mute').deleteOne({ _id: mention.id });
            await msg.channel.send(embed);
        } catch (err) {
            await msg.channel.send({'embed':{
                'title': ":x: > I can't unmute this person!"
            }});
        }

        Kwako.log.info({msg: 'unmute', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.user.tag }})
    }
};

module.exports.help = {
    name: 'unmute',
    usage: 'unmute (mention someone)',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
}
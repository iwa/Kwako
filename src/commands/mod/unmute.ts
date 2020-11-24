import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if (!msg.member.hasPermission('KICK_MEMBERS')) return;

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

        const embed = new MessageEmbed()
            .setColor(14349246)
            .setTitle(`✅ **${mention.user.username}** has been unmuted`);

        try {
            await mention.roles.remove(guildConf.muteRole);
            await Kwako.db.collection('mute').deleteOne({ _id: mention.id });
            await msg.channel.send(embed);
        } catch (err) {
            await msg.channel.send({'embed':{
                'title': ":x: > I can't unmute this person!"
            }});
        }

        let modLogChannel = guildConf.modLogChannel;
        if(modLogChannel) {
            let channel = await Kwako.channels.fetch(modLogChannel);
            const embedLog = new MessageEmbed()
                .setTitle("Member unmuted")
                .setDescription(`**Who:** ${mention.user.tag} (<@${mention.id}>)\n**By:** <@${msg.author.id}>`)
                .setColor(14349246)
                .setTimestamp(msg.createdTimestamp)
                .setFooter("Date of unmute:")
                .setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            await (channel as TextChannel).send(embedLog);
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
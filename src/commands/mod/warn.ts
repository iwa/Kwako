import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if (!msg.member.hasPermission('KICK_MEMBERS')) return;

    if (args.length >= 1 && msg.channel.type !== 'dm') {
        if (msg.mentions.everyone) return;
        let modLogChannel = guildConf.modLogChannel;

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
        if(args.length >= 1)
            reason = args.join(" ")

        const embed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle(`⚠️ **${mention.user.username}**, you've been warned`)
            .setDescription(`**Reason:** ${reason}`);

        try {
            await msg.channel.send(embed);

            if(modLogChannel) {
                let channel = await Kwako.channels.fetch(modLogChannel);
                let embedLog = new MessageEmbed()
                    .setTitle("⚠️ Member warned")
                    .setDescription(`**Who:** ${mention.user.tag} (<@${mention.id}>)\n**By:** <@${msg.author.id}>\n**Reason:** \`${reason}\``)
                    .setColor('ORANGE')
                    .setTimestamp(msg.createdTimestamp)
                    .setFooter("Date of mute:")
                    .setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
                await (channel as TextChannel).send(embedLog);
            }
        } catch (err) {
            return;
        }

        Kwako.log.info({msg: 'warn', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.user.tag, reason: reason }})
    }
};

module.exports.help = {
    name: 'warn',
    usage: 'warn (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
}
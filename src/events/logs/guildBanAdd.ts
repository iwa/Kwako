/**
 * Elements related to the guildBanAdd event
 * @packageDocumentation
 * @module LogGuildBanAdd
 * @category Events
 */
import Kwako from '../../Client'
import { User, TextChannel, MessageEmbed, Guild, PartialUser } from 'discord.js';

export default async function guildBanAdd(guild: Guild, user: User | PartialUser, modLogChannel: string) {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
    }).catch(() => {return;});

    if(!fetchedLogs) return;

	const banLog = fetchedLogs.entries.first();

	if (!banLog) return;

	const { executor, target, createdTimestamp, reason } = banLog;

	if ((target as User).id === user.id) {
        let channel = await Kwako.channels.fetch(modLogChannel).catch(() => {return});
        if(!channel) return Kwako.db.collection('guilds').updateOne({ _id: guild.id }, { $set: { 'config.modLogChannel': "" } });

        let embed = new MessageEmbed();
        embed.setTitle("🔨 Member banned");
        embed.setDescription(`**Who:** ${user.tag} (<@${user.id}>)\n**By:** ${executor.tag} (<@${executor.id}>)\n**Reason:** \`${reason || "no reason provided"}\``);
        embed.setColor(13632027);
        embed.setTimestamp(createdTimestamp);
        embed.setFooter("Date of ban:")
        embed.setAuthor(executor.username, executor.avatarURL({ format: 'png', dynamic: false, size: 128 }))
        return (channel as TextChannel).send(embed);
	}
}

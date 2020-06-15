/**
 * Elements related to the guildBanAdd event
 * @packageDocumentation
 * @module LogGuildBanAdd
 * @category Events
 */
import { User, Client, TextChannel, MessageEmbed, Guild, PartialUser } from 'discord.js';

export default async function guildBanAdd(guild: Guild, user: User | PartialUser, bot: Client, modLogChannel: string) {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
	});
	const banLog = fetchedLogs.entries.first();

	if (!banLog) return;

	const { executor, target, createdTimestamp, reason } = banLog;

	if ((target as User).id === user.id) {
        let channel = await bot.channels.fetch(modLogChannel);
        let embed = new MessageEmbed();
        embed.setTitle("Member banned");
        embed.setDescription(`Who: ${user.tag} (<@${user.id}>)\nBy: <@${executor.id}>\nReason:\`\`\`${reason ? reason : "no reason"}\`\`\``);
        embed.setColor(13632027);
        embed.setTimestamp(createdTimestamp);
        embed.setFooter("Date of ban:")
        embed.setAuthor(executor.username, executor.avatarURL({ format: 'png', dynamic: false, size: 128 }))
        return (channel as TextChannel).send(embed);
	}
}

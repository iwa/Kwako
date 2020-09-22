/**
 * Elements related to the guildMemberRemove event
 * @packageDocumentation
 * @module LogGuildMemberRemove
 * @category Events
 */
import Kwako from '../../Client'
import { User, TextChannel, MessageEmbed, GuildMember, PartialGuildMember } from 'discord.js';

export default async function guildMemberRemove(member: GuildMember | PartialGuildMember, modLogChannel: string) {
    let isBan = await member.guild.fetchBan(member.id).catch(() => {return});
    if(isBan) return;

	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK',
	}).catch(() => {return;});

    if(!fetchedLogs) return;

	const kickLog = fetchedLogs.entries.first();

	if (!kickLog) return;

	const { executor, target, createdTimestamp, reason } = kickLog;

	if ((target as User).id === member.id) {
        let channel = await Kwako.channels.fetch(modLogChannel).catch(() => {return});
        if(!channel) return Kwako.db.collection('settings').updateOne({ _id: member.guild.id }, { $set: { 'config.modLogChannel': "" } });

        let embed = new MessageEmbed();
        embed.setTitle("Member kicked");
        embed.setDescription(`**Who:** ${member.user.tag} (<@${member.id}>)\n**By:** ${executor.tag} (<@${executor.id}>)\n**Reason:** \`${reason || "no reason provided"}\``);
        embed.setColor(15260213);
        embed.setTimestamp(createdTimestamp);
        embed.setFooter("Date of kick:")
        embed.setAuthor(executor.username, executor.avatarURL({ format: 'png', dynamic: false, size: 128 }))
        return (channel as TextChannel).send(embed);
	}
}

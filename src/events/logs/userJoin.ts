/**
 * Elements related to the messageDelete event
 * @packageDocumentation
 * @module LogMessageDelete
 * @category Events
 */
import Kwako from '../../Client'
import { TextChannel, MessageEmbed, GuildMember, PartialGuildMember } from 'discord.js';

export default async function userJoin(member: GuildMember | PartialGuildMember, modLogChannel: string) {
    if (!member.guild) return;

    let channel = await Kwako.channels.fetch(modLogChannel);
    let embed = new MessageEmbed();
    embed.setTitle("➕ New member");
    embed.setDescription(`${member.user.tag} (<@${member.id}>)`);
    embed.setColor(11790067);
    embed.setTimestamp(Date.now());
    embed.setFooter("Date of edit:")
    embed.setAuthor(member.user.username, member.user.avatarURL({ format: 'png', dynamic: false, size: 128 }))

    return (channel as TextChannel).send(embed);
}

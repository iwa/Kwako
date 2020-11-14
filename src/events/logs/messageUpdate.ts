/**
 * Elements related to the messageDelete event
 * @packageDocumentation
 * @module LogMessageDelete
 * @category Events
 */
import Kwako from '../../Client'
import { Message, PartialMessage, TextChannel, MessageEmbed } from 'discord.js';

export default async function messageUpdate(msg: Message | PartialMessage, oldmsg: Message | PartialMessage, modLogChannel: string, prefix: string, suggestionChannel: string) {
    if (!msg.guild) return;
    if (msg.content.startsWith(prefix)) return;
    if(msg.author.bot) return;

    let channel = await Kwako.channels.fetch(modLogChannel);
    let embed = new MessageEmbed();
    embed.setTitle("Message edited");
    embed.setDescription(`**Author:** ${msg.author.tag} (<@${msg.author.id}>)\n**Where:** <#${msg.channel.id}>`);
    embed.setColor(16098851);
    embed.setTimestamp(msg.editedTimestamp);
    embed.setFooter("Date of edit:")
    embed.setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))

    embed.addField('old', `\`\`\`${oldmsg.cleanContent}\`\`\``);
    embed.addField('new', `\`\`\`${msg.cleanContent}\`\`\``);

    return (channel as TextChannel).send(embed);
}

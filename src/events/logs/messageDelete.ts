/**
 * Elements related to the messageDelete event
 * @packageDocumentation
 * @module LogMessageDelete
 * @category Events
 */
import Kwako from '../../Client'
import { Message, User, PartialMessage, TextChannel, MessageEmbed, Util } from 'discord.js';
let lastTimestamp: Map<string, number> = new Map();

(async () => {
    for(const guild of Kwako.guilds.cache.array()) {
        let fetchedLogs = await guild.fetchAuditLogs({
	    	limit: 1,
	    	type: 'MESSAGE_DELETE',
	    }).catch(() => {return;});

        if (!fetchedLogs) return;

	    let deletionLog = fetchedLogs.entries.first();

	    if (!deletionLog) return;

        let { createdTimestamp } = deletionLog;
        lastTimestamp.set(guild.id, createdTimestamp);
    }
})

export default async function messageDelete(msg: Message | PartialMessage, modLogChannel: string, prefix: string, suggestionChannel: string) {
    if (!msg.guild) return;
    if (msg.content.startsWith(prefix)) return;
	const fetchedLogs = await msg.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	}).catch(() => {return;});

    if (!fetchedLogs) return selfDelete(msg, modLogChannel);

	const deletionLog = fetchedLogs.entries.first();

	if (!deletionLog) return selfDelete(msg, modLogChannel);

    const { executor, target, createdTimestamp } = deletionLog;

    if (lastTimestamp.get(msg.guild.id) === createdTimestamp) {
        if ((target as User).id === msg.author.id) return;
        if (suggestionChannel && suggestionChannel === msg.channel.id) return;
        selfDelete(msg, modLogChannel);
    }
    lastTimestamp.set(msg.guild.id, createdTimestamp);

	if ((target as User).id === msg.author.id) {
        if(msg.author.id === Kwako.user.id) return;
        let channel = await Kwako.channels.fetch(modLogChannel);
        let embed = new MessageEmbed();
        embed.setTitle("❌ Message deleted");
        embed.setDescription(`**Author:** ${msg.author.tag} (<@${msg.author.id}>)\n**Deleted by:** ${executor.tag} (<@${executor.id}>)\n**Where:** <#${msg.channel.id}>\n\`\`\`${msg.cleanContent || "empty message"}\`\`\``);
        embed.setColor(10613368);
        embed.setTimestamp(createdTimestamp);
        embed.setFooter("Date of deletion:")
        embed.setAuthor(executor.username, executor.avatarURL({ format: 'png', dynamic: false, size: 128 }))
        if(msg.embeds[0])
            embed.addField('embed', `\`\`\`markdown\n# ${Util.escapeMarkdown(msg.embeds[0].title || " ")}\n${Util.escapeMarkdown(msg.embeds[0].description || " ")}\`\`\``);
        if(msg.attachments.first()) {
            embed.setImage(msg.attachments.first().proxyURL);
            embed.addField('attachment', `[link](${msg.attachments.first().proxyURL})`);
        }
        return (channel as TextChannel).send(embed);
	}
}

async function selfDelete(msg: Message | PartialMessage, modLogChannel: string) {
    if (msg.author.bot) return;
    let channel = await Kwako.channels.fetch(modLogChannel).catch(() => {return});
    if(!channel) return Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { 'config.modLogChannel': "" } });

    let embed = new MessageEmbed();
    embed.setTitle("🗑 Message Self-deleted");
    embed.setDescription(`**Author:** ${msg.author.tag} (<@${msg.author.id}>)\n**Where:** <#${msg.channel.id}>\n\`\`\`${msg.cleanContent || "empty message"}\`\`\``);
    embed.setColor(5753229);
    embed.setTimestamp(new Date());
    embed.setFooter("Date of deletion:")
    if(msg.embeds[0])
        embed.addField('embed', `\`\`\`markdown\n# ${Util.escapeMarkdown(msg.embeds[0].title)}\n${Util.escapeMarkdown(msg.embeds[0].description)}\`\`\``);
    if(msg.attachments.first()) {
        embed.setImage(msg.attachments.first().proxyURL);
        embed.addField('attachment', `[link](${msg.attachments.first().proxyURL})`);
    }

    return (channel as TextChannel).send(embed);
}
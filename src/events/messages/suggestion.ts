import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

export default async function suggestion (bot: typeof Kwako, msg: Message) {
    let req = msg.cleanContent;
    let channel = msg.channel;

    let embed = new MessageEmbed();
    embed.setDescription(req);
    embed.setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))

    let guild: { _id: string, suggestions: string[] } = await bot.db.collection('suggestions').findOne({ _id: msg.guild.id });
    if(!guild) {
        await bot.db.collection('suggestions').insertOne({ _id: msg.guild.id, suggestions: [] });
        guild = { _id: msg.guild.id, suggestions: [] };
    }

    embed.setFooter(`#${guild.suggestions.length+1}`);

    await msg.delete();
    let sent = await (channel as TextChannel).send(embed);
    await bot.db.collection('suggestions').updateOne({ _id: msg.guild.id }, { $push: { suggestions: sent.id }});

    await sent.react('✅');
    await sent.react('❌');
    return sent.react('👀');
}
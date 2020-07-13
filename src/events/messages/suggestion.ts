import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { Db } from 'mongodb';

export default async function suggestion (bot: Client, msg: Message, db: Db) {
    let req = msg.cleanContent;
    let channel = msg.channel;

    let embed = new MessageEmbed();
    embed.setDescription(req);
    embed.setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))

    let guild: { _id: string, suggestions: string[] } = await db.collection('suggestions').findOne({ _id: msg.guild.id });
    if(!guild) {
        await db.collection('suggestions').insertOne({ _id: msg.guild.id, suggestions: [] });
        guild = { _id: msg.guild.id, suggestions: [] };
    }

    embed.setFooter(`#${guild.suggestions.length+1}`);

    await msg.delete();
    let sent = await (channel as TextChannel).send(embed);
    await db.collection('suggestions').updateOne({ _id: msg.guild.id }, { $push: { suggestions: sent.id }});

    await sent.react('✅');
    await sent.react('❌');
    return sent.react('👀');
};
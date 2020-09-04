import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

export default async function suggestion (msg: Message, isPremium: boolean) {
    let req = msg.cleanContent;
    let channel = msg.channel;

    if(isPremium) {
    let found = req.match(/#{1}\d+/gm);

    if(found) {
        for(const id of found) {
            let num = id.slice(1, id.length);

            let guild: { _id: string, suggestions: string[] } = await Kwako.db.collection('suggestions').findOne({ _id: msg.guild.id }) || null;
            if (guild && guild.suggestions) {

                let message = guild.suggestions[parseInt(num, 10) - 1];
                if (message) {

                    let suggestion = await msg.channel.messages.fetch(message).catch(() => { return; });
                    if (suggestion)
                        req = req.replace(id, `[${id}](${suggestion.url})`);
                }
            }
        }
    }
    }

    let embed = new MessageEmbed();
    embed.setDescription(req);
    embed.setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))

    let guild: { _id: string, suggestions: string[] } = await Kwako.db.collection('suggestions').findOne({ _id: msg.guild.id });
    if(!guild) {
        await Kwako.db.collection('suggestions').insertOne({ _id: msg.guild.id, suggestions: [] });
        guild = { _id: msg.guild.id, suggestions: [] };
    }

    embed.setFooter(`#${guild.suggestions.length+1}`);

    await msg.delete();
    let sent = await (channel as TextChannel).send(embed);
    await Kwako.db.collection('suggestions').updateOne({ _id: msg.guild.id }, { $push: { suggestions: sent.id }});

    await sent.react('✅');
    await sent.react('❌');
    return sent.react('🔔');
}
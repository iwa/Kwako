import Kwako from '../../Client'
import { Message, TextChannel, MessageEmbed } from 'discord.js';

module.exports.run = async (msg: Message, args: string[], guildConf: { suggestionChannel: string; }) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    let guild: { _id: string, suggestions: string[] } = await Kwako.db.collection('suggestions').findOne({ _id: msg.guild.id }) || null;
    if(!guild || !guild.suggestions)
        return msg.react('❌');

    let message = guild.suggestions[parseInt(args[0]) - 1];
    if(!message)
        return msg.react('❌');

    let channel = await Kwako.channels.fetch(guildConf.suggestionChannel);
    let suggestion = await (channel as TextChannel).messages.fetch(message)

    let embed = suggestion.embeds[0];

    embed.setColor(4289797)

    let desc = embed.description;
    embed.setDescription(`${desc}\n\n**✅ Implemented by ${msg.author.username}**\n\n`);

    let reactions = suggestion.reactions.resolve('👀');
    let users = await reactions.users.fetch();

    let embedDM = new MessageEmbed();
    embedDM.setTitle(`Suggestion "${embed.description.slice(0, 10)}..." has been updated!`);
    embedDM.setDescription(`Check it out [here](${suggestion.url})`)

    for(const user of users.array()) {
        if(!user.bot)
            await user.send(embedDM).catch(() => {return});
    }

    await suggestion.edit(embed);

    Kwako.log.info({msg: 'implemented', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});

    return msg.react('✅');
};

module.exports.help = {
    name: 'implemented',
    usage: "?implemented (id)",
    staff: true
};
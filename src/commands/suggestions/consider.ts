import { Client, Message, TextChannel, MessageEmbed } from 'discord.js';
import { Db } from 'mongodb';
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger, commands: any, guildConf: { suggestionChannel: string; }) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    let guild: { _id: string, suggestions: string[] } = await db.collection('suggestions').findOne({ _id: msg.guild.id }) || null;
    if(!guild || !guild.suggestions)
        return msg.react('❌');

    let message = guild.suggestions[parseInt(args[0]) - 1];
    if(!message)
        return msg.react('❌');

    let channel = await bot.channels.fetch(guildConf.suggestionChannel);
    let suggestion = await (channel as TextChannel).messages.fetch(message)

    let embed = suggestion.embeds[0];

    embed.setColor(14598460)

    let req = "\n";
    if(args.length >= 2) {
        args.shift()
        req = args.join(' ');
    }
    let desc = embed.description;
    embed.setDescription(`${desc}\n\n**🤔 Considered by ${msg.author.username}**\n${req}`);

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

    log.info({msg: 'consider', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});

    return msg.react('✅');
};

module.exports.help = {
    name: 'consider',
    usage: "consider (uid) [reason]",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
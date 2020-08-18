import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
const al = require('anilist-node');
const Anilist = new al();

module.exports.run = (msg: Message, args: string[]) => {
    if (args.length < 1) return;
    let req = args.join(' ');
    Anilist.search('manga', req, 1, 5).then(async (data: { media: any[]; }) => {
        let sent = await msg.channel.send({
            "embed": {
              "title": "🔍",
              "description": `:one: ${data.media[0].title.romaji}\n:two: ${data.media[1].title.romaji}\n:three: ${data.media[2].title.romaji}\n:four: ${data.media[3].title.romaji}\n:five: ${data.media[4].title.romaji}`,
              "color": 4886754
            }
        });
        await sent.react('1️⃣'); await sent.react('2️⃣'); await sent.react('3️⃣'); await sent.react('4️⃣'); await sent.react('5️⃣');

        let collected = await sent.awaitReactions((_reaction, user) => (['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 30000 })

        sent.delete();
        if (collected.first() == undefined) return;

        let emote = collected.first().emoji.name

        let res;
        switch (emote) {
            case '1️⃣':
                res = data.media[0];
            break;

            case '2️⃣':
                res = data.media[1];
            break;

            case '3️⃣':
                res = data.media[2];
            break;

            case '4️⃣':
                res = data.media[3];
            break;

            case '5️⃣':
                res = data.media[4];
            break;

            default:
                return;
        }

        let info = await Anilist.media.manga(res.id)
        const embed = new MessageEmbed();
        if (info.title.romaji == info.title.english)
            embed.setTitle(`**${info.title.romaji}**`)
        else
            embed.setTitle(`**${info.title.romaji} / ${info.title.english}**`)
        embed.setThumbnail(info.coverImage.large)
        embed.addField("Status", info.status, true)
        if (info.volumes != null)
            embed.addField("Volumes", info.volumes, true)
        embed.addField("Format", info.format, false)
        embed.addField("Started on", `${info.startDate.year}/${info.startDate.month}/${info.startDate.day}`, true)
        if (info.endDate.day != null)
            embed.addField("Ended on", `${info.endDate.year}/${info.endDate.month}/${info.endDate.day}`, true)
        embed.addField("Genres", info.genres.toString(), false)
        embed.setColor('BLUE')
        embed.setURL(info.siteUrl)

        Kwako.log.info({msg: 'manga', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, request: req});
        return msg.channel.send(embed)
    }).catch((err: any) => {
        Kwako.log.error(err)
        return msg.channel.send({ 'embed': { 'title': ":x: > **An error occured, please retry later.**" } })
    });
};

module.exports.help = {
    name: 'manga',
    usage: "manga (title)",
    desc: "See some info about a manga series.",
    perms: ['EMBED_LINKS']
};
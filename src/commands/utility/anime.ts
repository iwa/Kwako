import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
const al = require('anilist-node');
const Anilist = new al();

let number = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];

module.exports.run = (msg: Message, args: string[]) => {
    if (args.length < 1) return;
    let req = args.join(' ');
    Anilist.search('anime', req, 1, 5).then(async (data: { media: any[]; }) => {
        let desc = "";

        for(let i = 0; i < data.media.length; i++)
            desc = `${desc}${number[i]} ${data.media[i].title.romaji}\n`

        let sent = await msg.channel.send({
            "embed": {
              "title": "🔍",
              "description": desc,
              "color": 4886754
            }
        });

        for(let i = 0; i < data.media.length; i++)
            await sent.react(number[i])

        let collected = await sent.awaitReactions((_reaction, user) => (['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 30000 })

        sent.delete();
        if (collected.first() == undefined) return;

        let emote = collected.first().emoji.name

        let res;
        switch (emote) {
            case '1️⃣':
                if(!data.media[0]) return;
                res = data.media[0];
            break;

            case '2️⃣':
                if(!data.media[1]) return;
                res = data.media[1];
            break;

            case '3️⃣':
                if(!data.media[2]) return;
                res = data.media[2];
            break;

            case '4️⃣':
                if(!data.media[3]) return;
                res = data.media[3];
            break;

            case '5️⃣':
                if(!data.media[4]) return;
                res = data.media[4];
            break;

            default:
                return;
        }

        if(!res) return msg.react('❌');

        let info = await Anilist.media.anime(res.id)
        const embed = new MessageEmbed();
        if (info.title.romaji === info.title.english || !info.title.english)
            embed.setTitle(`**${info.title.romaji}**`)
        else
            embed.setTitle(`**${info.title.romaji} / ${info.title.english}**`)

        embed.setThumbnail(info.coverImage.large)

        embed.addField("Status", info.status, true)
        if (info.episodes != null)
            embed.addField("Episodes", info.episodes, true)

        embed.addField("Format", info.format, true)
        embed.addField("Duration per ep", `${info.duration}min`, true)

        embed.addField("Started on", `${info.startDate.year}/${info.startDate.month}/${info.startDate.day}`, true)
        if (info.endDate.day != null)
            embed.addField("Ended on", `${info.endDate.year}/${info.endDate.month}/${info.endDate.day}`, true)

        embed.addField("Genres", info.genres.toString(), false)
        embed.setColor('BLUE')
        embed.setURL(info.siteUrl)

        Kwako.log.info({msg: 'anime', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, request: req});
        return msg.channel.send(embed)
    }).catch((err: any) => {
        Kwako.log.error(err)
        return msg.channel.send({ 'embed': { 'title': ":x: > **An error occured, please retry later.**" } })
    });
};

module.exports.help = {
    name: 'anime',
    usage: "anime (title)",
    desc: "Get some info about an anime series.",
    perms: ['EMBED_LINKS']
};
import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
import anilistSearch from '../../utils/anilistSearch';
const al = require('anilist-node');
const Anilist = new al();

module.exports.run = (msg: Message, args: string[]) => {
    if (args.length < 1) return;
    let req = args.join(' ');
    Anilist.search('anime', req, 1, 5).then(async (data: { media: any[]; }) => {
        let res = await anilistSearch(msg, data);

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
import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
import utilities from '../../utils/utilities'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if (args.length > 1) return;

    switch (args[0]) {
        case "xp":
        case "exp":
        case "level":
        case "lvl": {
            guildConf.useExpSystem &&= true;
            if(guildConf.useExpSystem)
                return leaderboard(msg, 'exp', false)
            else
                return msg.channel.send(':x: > Sorry, but the experience system has been disabled in the server. Ask someone in the staff to re-enable it in order to use this command.')
        }

        case "pat":
        case "pats":
        case "patpat":
        case "patpats":
            return leaderboard(msg, 'pat', false)

        case "hug":
        case "hugs":
            return leaderboard(msg, 'hug', false)

        case "boop":
        case "boops":
            return leaderboard(msg, 'boop', false)

        case "slap":
        case "slaps":
            return leaderboard(msg, 'slap', false)

        case "glare":
        case "glares":
            return leaderboard(msg, 'glare', false)

        case "squish":
        case "squishes":
            return leaderboard(msg, 'squish', true)

        case "tickle":
        case "tickles":
            return leaderboard(msg, 'tickle', false)

        case "kiss":
        case "kisses":
            return leaderboard(msg, 'kiss', true)

        case "tongueout":
        case "tongueouts":
            return leaderboard(msg, 'tongueout', false)

        default:
            msg.channel.send({ "embed": { "title": "`exp | pat | hug | boop | slap | glare | squish | tickle | kiss | tongueout`", "color": 3396531 } });
            break;
    }
};

module.exports.help = {
    name: 'leaderboard',
    aliases: ['lead', 'lb', 'top'],
    usage: "leaderboard",
    desc: "Show the exp points leaderboard of the server",
    perms: ['EMBED_LINKS']
};

async function leaderboard (msg: Message, type: string, e: boolean) {
    let guild = `${type}.${msg.guild.id}`
    let leaderboard = await Kwako.db.collection('user').find({ [guild]: { $exists: true } }).sort({ [guild]: -1 }).limit(10).toArray();
    let n = 0;

    let title = `${type.charAt(0).toUpperCase()}${type.slice(1)}`

    const embed = new MessageEmbed();
    embed.setColor(16114507)
    embed.setTitle(`:trophy: **${title} Leaderboard**`)
    let desc = "";

    let bar = new Promise<void>((resolve) => {
        leaderboard.forEach(async (elem, index) => {
            let member = await msg.guild.members.fetch(elem._id).catch(() => {return});
            if(member) {
                if(elem[type][msg.guild.id] < 0) {
                    elem[type][msg.guild.id] *= -1;
                    await Kwako.db.collection('user').updateOne({ _id: elem._id }, { $mul: { [guild]: -1 }});
                }

                n++;
                if(n === 1)
                    desc = `${desc}:first_place: `
                if(n === 2)
                    desc = `${desc}:second_place: `
                if(n === 3)
                    desc = `${desc}:third_place: `
                if(n > 3)
                    desc = `${desc}**${n}.** `

                if (type === 'exp') {
                    let level = utilities.levelInfo(elem.exp[msg.guild.id])
                    desc = `${desc}**${member.user.username}**\nLevel ${level.level} (${elem.exp[msg.guild.id]} exps)\n`
                } else
                    desc = `${desc}**${member.user.username}**\n${elem[type][msg.guild.id]} ${type}${e ? "e" : ""}s\n`

            } else {
                await Kwako.db.collection('user').updateOne({ _id: elem._id }, { $mul: { [guild]: -1 }});
            }
            if (index === leaderboard.length - 1) resolve();
        })
    });

    bar.then(async () => {
        embed.setDescription(desc)
        msg.channel.send(embed)
            .then(() => {
                Kwako.log.info({msg: 'leaderboard', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, type: type});
            }).catch(Kwako.log.error)
    });
}
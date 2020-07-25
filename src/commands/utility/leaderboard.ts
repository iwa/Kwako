import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
import utilities from '../../utils/utilities'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if (args.length > 1) return;

    switch (args[0]) {
        case "xp":
        case "exp":
            return leaderboard(bot, msg, db, 'exp', false)

        case "pat":
        case "pats":
        case "patpat":
        case "patpats":
            return leaderboard(bot, msg, db, 'pat', false)

        case "hug":
        case "hugs":
            return leaderboard(bot, msg, db, 'hug', false)

        case "boop":
        case "boops":
            return leaderboard(bot, msg, db, 'boop', false)

        case "slap":
        case "slaps":
            return leaderboard(bot, msg, db, 'slap', false)

        case "glare":
        case "glares":
            return leaderboard(bot, msg, db, 'glare', false)

        case "squish":
        case "squishes":
            return leaderboard(bot, msg, db, 'squish', true)

        case "tickle":
        case "tickles":
            return leaderboard(bot, msg, db, 'tickle', false)

        default:
            msg.channel.send({ "embed": { "title": "`exp | pat | hug | boop | slap`", "color": 3396531 } });
            break;
    }
};

module.exports.help = {
    name: 'leaderboard',
    aliases: ['lead'],
    usage: "leaderboard",
    desc: "Show the exp points leaderboard of the server",
    perms: ['EMBED_LINKS']
};

async function leaderboard (bot: Client, msg: Message, db: Db, type: string, e: boolean) {
    let guild = `${type}.${msg.guild.id.toString()}`
    let leaderboard = await db.collection('user').find({ [guild]: { $exists: true } }).sort({ [guild]: -1 }).limit(10).toArray();
    let n = 0;

    let title = `${type.charAt(0).toUpperCase()}${type.slice(1)}`

    const embed = new MessageEmbed();
    embed.setColor(16114507)
    embed.setTitle(`:trophy: **${title} Leaderboard**`)
    let desc = "";

    let bar = new Promise((resolve) => {
        leaderboard.forEach(async (elem, index) => {
            let member = await msg.guild.members.fetch(elem._id).catch(() => {return});
            if(member) {
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
                await db.collection('user').updateOne({ _id: elem._id }, { $mul: { [guild]: -1 }});
            }
            if (index === leaderboard.length - 1) resolve();
        })
    });

    bar.then(async () => {
        embed.setDescription(desc)
        msg.channel.send(embed)
            .then(() => {
                console.log(`info: exp leaderboard: ${msg.author.tag}`);
            }).catch(console.error)
    });
}
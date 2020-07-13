import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
import utilities from '../../utils/utilities'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    let guild = `exp.${msg.guild.id.toString()}`
    let leaderboard = await db.collection('user').find({ [guild]: { $exists: true } }).sort({ [guild]: -1 }).limit(10).toArray();
    let n = 0;

    msg.channel.startTyping()

    const embed = new MessageEmbed();
    embed.setColor(16114507)
    embed.setTitle(`:trophy: **Experience Points Leaderboard**`)
    let desc = "";

    let bar = new Promise((resolve, reject) => {
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

                let level = utilities.levelInfo(elem.exp[msg.guild.id])
                desc = `${desc}**${member.user.username}**\nLevel ${level.level} (${elem.exp[msg.guild.id]} exps)\n`

            }
            if (index === leaderboard.length - 1) resolve();
        })
    });

    bar.then(async () => {
        embed.setDescription(desc)
        msg.channel.send(embed)
            .then(() => {
                console.log(`info: exp leaderboard: ${msg.author.tag}`);
                msg.channel.stopTyping()
            }).catch(console.error)
    });
};

module.exports.help = {
    name: 'leaderboard',
    aliases: ['lead'],
    usage: "leaderboard",
    desc: "Show the exp points leaderboard of the server",
    perms: ['EMBED_LINKS']
};
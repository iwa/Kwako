import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
import utilities from '../../utils/utilities'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    let guild = `exp.${msg.guild.id.toString()}`
    let leaderboard = await db.collection('user').find().sort({ [guild]: -1 }).limit(10).toArray();
    let n = 0;

    msg.channel.startTyping()

    const embed = new MessageEmbed();
    embed.setColor(16114507)
    embed.setTitle(`:trophy: **Experience Points Leaderboard**`)
    let desc = "";

    leaderboard.forEach(async elem => {
        let user = await msg.guild.members.fetch(elem._id)
        if(!user || !elem.exp[msg.guild.id]) return;
        n++;
        let level = utilities.levelInfo(elem.exp[msg.guild.id])
        if(n === 1)
            desc = `${desc}:first_place: `
        if(n === 2)
            desc = `${desc}:second_place: `
        if(n === 3)
            desc = `${desc}:third_place: `
        desc = `${desc}**${n}. <@${user.id}>**\n**Level ${level.level}** (${elem.exp[msg.guild.id]} exps)\n`
    })

    setTimeout(() => {
        embed.setDescription(desc)
        msg.channel.send(embed)
            .then(() => {
                console.log(`info: exp leaderboard: ${msg.author.tag}`);
                msg.channel.stopTyping(true)
            }).catch(console.error)
    }, 1500)
};

module.exports.help = {
    name: 'leaderboard',
    usage: "leaderboard",
    desc: "Show the exp points leaderboard of the server"
};
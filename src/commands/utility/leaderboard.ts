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

    leaderboard.forEach(async elem => {
        let user = await bot.users.fetch(elem._id)
        n++;
        embed.addField(`**${n}. ${user.username}**`, `${elem.exp[msg.guild.id]} exps`)
    })

    setTimeout(() => {
        msg.channel.send(embed)
            .then(() => {
                console.log(`info: exp leaderboard: ${msg.author.tag}`);
                msg.channel.stopTyping()
            }).catch(console.error)
    }, 1500)
};

module.exports.help = {
    name: 'leaderboard',
    usage: "?leaderboard",
    desc: "Show the exp points leaderboard of the server"
};
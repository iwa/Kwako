import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
import utilities from '../../utils/utilities'

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    if (args.length == 1) {
        if (msg.mentions.everyone) return;
        let mention = msg.mentions.users.first()
        if (!mention) return;
        return profileImg(bot, msg, db, mention.id);
    } else
        return profileImg(bot, msg, db, msg.author.id);
};

module.exports.help = {
    name: 'profile',
    usage: "?profile [mention someone]",
    desc: "Print your or someone's profile"
};

async function profileImg(bot: Client, msg: Message, db: Db, id: string) {
    let userDB = await db.collection('user').findOne({ '_id': { $eq: id } });

    msg.channel.startTyping();

    let userDiscord = await bot.users.fetch(id)
    let memberDiscord = await msg.guild.members.fetch(id)

    if (!userDB || !userDB.exp[msg.guild.id]) {
        let embed = new MessageEmbed();

        embed.setTitle(userDiscord.tag)
        embed.setDescription(`Level 1\n(0/25 exp)`)
        embed.setThumbnail(userDiscord.avatarURL({ format: 'png', dynamic: false, size: 256 }))
        return msg.channel.send(embed).then(() => { msg.channel.stopTyping(true) });
    }

    let guild = `exp.${msg.guild.id.toString()}`
    let leadXP = await db.collection('user').find().sort({ [guild]: -1 }).toArray();

    let lvlInfo = utilities.levelInfo(userDB.exp[msg.guild.id]);

    let user = {
        avatar: userDiscord.avatarURL({ format: 'png', dynamic: false, size: 256 }),
        username: userDiscord.username,
        exp: userDB.exp[msg.guild.id],
        positionExp: leadXP.findIndex(val => val._id == id),
        level: lvlInfo.level,
        current: lvlInfo.current,
        max: lvlInfo.max
    }

    let embed = new MessageEmbed();

    embed.setTitle(userDiscord.tag)
    embed.setDescription(`Level ${user.level} | #${user.positionExp}\n(${user.current}/${user.max} exp)`)
    embed.setThumbnail(user.avatar)
    embed.setColor(memberDiscord.displayColor);

    try {
        console.log(`info: profile by ${msg.author.tag}`)
        return msg.channel.send(embed).then(() => { msg.channel.stopTyping(true) });
    } catch (err) {
        console.error(err)
        return msg.channel.send(":x: > An error occured. Please retry later.")
    }
}
import { Client, Message, MessageReaction, User, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
import utilities from '../../utils/utilities';
import { Logger } from 'pino';
let lastGif: number = 0, count: number = 9;
let lastGifFail: number = 0, countFail: number = 5;

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    if (msg.mentions.everyone) return;
    let mention = msg.mentions.users.first()
    if (!mention) return;

    if (mention.id === msg.author.id)
        return msg.channel.send({ "embed": { "title": `:x: > **You can't highfive youself!**`, "color": 13632027 } });

    if (mention.id === bot.user.id) return;

    //let result = await db.collection('highfive').findOne({ 'author': { $eq: msg.author.id }, 'target': { $eq: mention.id } });
    //if (result)
    //    return msg.channel.send({ "embed": { "title": `:x: > **You already requested this user a highfive!**`, "color": 13632027 } });

    let reply = await msg.channel.send({
        "embed": {
            "title": "🙌",
            "description": `<@${msg.author.id}> wants to do a high five with you <@${mention.id}>!\nReact with ✋ to accept the highfive`,
            "color": 15916720,
            "footer": {
                "text": "(The request will fail in 30 seconds)"
            }
        }
    })

    let n = utilities.randomInt(count)
    while (lastGif == n)
        n = utilities.randomInt(count);
    lastGif = n;

    await reply.react('✋');

    let collected = await reply.awaitReactions((_reaction, user) => (_reaction.emoji.name === '✋') && (user.id === mention.id), { max: 1, time: 30000 })

    if (!collected.first()) {
        await reply.delete().catch(() => {return});

        let n = utilities.randomInt(countFail)
        while (lastGifFail == n)
            n = utilities.randomInt(countFail);
        lastGifFail = n;

        const embed = new MessageEmbed();
        embed.setColor('#F2DEB0')
        embed.setDescription(`**<@${msg.author.id}>**...`)
        embed.setImage(`https://${process.env.CDN_URL}/img/highfive/fail/${n}.gif`)
        return msg.channel.send(embed)
    }

    let emote = collected.first().emoji.name
    await reply.delete().catch(() => {return});

    if (emote === '✋') {
        const embed = new MessageEmbed();
        embed.setColor('#F2DEB0')
        embed.setDescription(`**<@${msg.author.id}> 🙌 <@${mention.id}>**`)
        embed.setImage(`https://${process.env.CDN_URL}/img/highfive/${n}.gif`)

        await db.collection('user').updateOne({ '_id': { $eq: msg.author.id } }, { $inc: { highfive: 1 } });
        await db.collection('user').updateOne({ '_id': { $eq: mention.id } }, { $inc: { highfive: 1 } });
        return msg.channel.send(embed)
            .then(() => {
                log.info({msg: 'highfive', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
            })
            .catch(log.error);
    } else {
        let n = utilities.randomInt(countFail)
        while (lastGifFail == n)
            n = utilities.randomInt(countFail);
        lastGifFail = n;

        const embed = new MessageEmbed();
        embed.setColor('#F2DEB0')
        embed.setDescription(`**<@${msg.author.id}>**...`)
        embed.setImage(`https://${process.env.CDN_URL}/img/highfive/fail/${n}.gif`)
        return msg.channel.send(embed)
    }
};

module.exports.help = {
    name: 'highfive',
    aliases: ['hifive'],
    usage: "highfive (mention someone)",
    desc: "Highfive people by mentioning them. Requires the target to react back!",
    perms: ['EMBED_LINKS']
};
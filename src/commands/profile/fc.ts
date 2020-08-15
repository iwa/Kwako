import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger, commands: any, guildConf: any) => {
    if (args.length === 1) {
        if (msg.mentions.everyone) return;
        let mention = msg.mentions.users.first()
        if (!mention) return;
        log.info({msg: 'fc', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.tag }});
        return printFc(bot, msg, db, mention.id, guildConf.prefix);
    } else {
        log.info({msg: 'fc', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: msg.author.id, name: msg.author.tag, }});
        return printFc(bot, msg, db, msg.author.id, guildConf.prefix);
    }
};

module.exports.help = {
    name: 'fc',
    aliases: ['friendcode'],
    usage: "fc",
    desc: "Print your Switch Friend Code in the channel you sent the command."
};

async function printFc(bot: Client, msg: Message, db: Db, id: string, prefix: string) {
    let user = await db.collection('user').findOne({ '_id': { $eq: id } });
    let member = await bot.users.fetch(id);
    let avatar = member.avatarURL({ format: 'png', dynamic: false, size: 128 })
    if (!user.fc && msg.mentions.users.size === 0)
        return msg.channel.send({
            "embed": {
                "title": `Do \`${prefix}setfc 1234-4567-7890\` to register it.`,
                "color": 15802940,
                "author": {
                    "name": "It looks like you haven't yet registered your Switch FC!",
                    "icon_url": avatar
                }
            }
        })
    else if (!user.fc)
        return msg.channel.send({
            "embed": {
                "color": 15802940,
                "author": {
                    "name": "It looks like they haven't yet registered their Switch FC!",
                    "icon_url": avatar
                }
            }
        })
    else
        return msg.channel.send({
            "embed": {
                "title": `**SW-${user.fc}**`,
                "color": 15802940,
                "author": {
                    "name": `${member.username}'s Switch FC`,
                    "icon_url": avatar
                }
            }
        })
}
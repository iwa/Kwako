import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    let embed = args.join(' ')
    embed = JSON.parse(embed)

    let sent = await msg.channel.send(embed)

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            log.error(ex)
        }
    }

    await db.collection('msg').insertOne({ _id: sent.id, channel: sent.channel.id })

    log.info({msg: 'addembed', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'addembed',
    usage: "addembed",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
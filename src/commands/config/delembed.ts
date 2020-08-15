import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 1) return;

    let dbEmbed = await db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let fetchMsg = await msg.channel.messages.fetch(args[0])

    if (msg.deletable && fetchMsg.deletable) {
        try {
            await msg.delete()
            await fetchMsg.delete()
        } catch (ex) {
            log.error(ex)
        }
    }

    await db.collection('msg').deleteOne({ _id: args[0] })

    log.info({msg: 'delembed', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'delembed',
    usage: "delembed (message uid)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
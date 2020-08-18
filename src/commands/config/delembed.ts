import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message, args: string[]) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 1) return;

    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let fetchMsg = await msg.channel.messages.fetch(args[0])

    if (msg.deletable && fetchMsg.deletable) {
        try {
            await msg.delete()
            await fetchMsg.delete()
        } catch (ex) {
            Kwako.log.error(ex)
        }
    }

    await Kwako.db.collection('msg').deleteOne({ _id: args[0] })

    Kwako.log.info({msg: 'delembed', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'delembed',
    usage: "delembed (message uid)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
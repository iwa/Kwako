import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message, args: string[]) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let fetchMsg = await msg.channel.messages.fetch(args[0]);

    args.shift()
    let embed = args.join(' ')
    embed = JSON.parse(embed)

    if (!fetchMsg.editable) return;
    await fetchMsg.edit(embed);

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            Kwako.log.error(ex)
        }
    }

    Kwako.log.info({msg: 'editembed', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'editembed',
    usage: "editembed (message id) (new embed)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
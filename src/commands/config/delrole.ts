import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message, args: string[]) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 2) return;

    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let fetchMsg = await msg.channel.messages.fetch(args[0])

    let emote = args[1]
    if((emote.startsWith('<:') || emote.startsWith('<a:')) && emote.endsWith('>'))
        emote = emote.slice(emote.length-19, emote.length-1);

    let thing = fetchMsg.reactions.cache.find(val => val.emoji.name == emote);
    await thing.remove();

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            Kwako.log.error(ex)
        }
    }

    await Kwako.db.collection('msg').updateOne({ _id: args[0] }, { $pull: { roles: { "emote": emote } } })

    Kwako.log.info({msg: 'delrole', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'delrole',
    usage: "delrole (message UID) (emote)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
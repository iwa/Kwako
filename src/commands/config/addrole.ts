import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message, args: string[]) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 3) return;

    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let embed = await msg.channel.messages.fetch(args[0])

    let emote = args[1]
    if((emote.startsWith('<:') || emote.startsWith('<a:')) && emote.endsWith('>'))
        emote = emote.slice(emote.length-19, emote.length-1);

    try {
        embed.react(emote)
    } catch (ex) {
        return msg.reply(":x: > Can't react!")
    }

    let role = args[2];
    if(role.startsWith('<@&') && role.endsWith('>')) {
        role = role.slice(3, (role.length-1))
        let chan = await msg.guild.roles.fetch(role);
        if(!chan || !chan.editable)
            return msg.channel.send(":x: > That role doesn't exist!")
    } else
        return msg.reply('please mention the role!')

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            Kwako.log.error(ex)
        }
    }

    await Kwako.db.collection('msg').updateOne({ _id: args[0] }, { $push: { roles: { "id": role, "emote": emote } } })

    Kwako.log.info({msg: 'addrole', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, role: { id: role, emote: emote }})
};

module.exports.help = {
    name: 'addrole',
    usage: "addrole (message UID) (emote) (mention role)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
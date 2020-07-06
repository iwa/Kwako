import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA || process.env.SUDO == '0')) return;
    if (args.length != 3) return;

    let dbEmbed = await db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let embed = await msg.channel.messages.fetch(args[0])

    let emote = args[1]
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
            console.error(ex)
        }
    }

    await db.collection('msg').updateOne({ _id: args[0] }, { $push: { roles: { "id": role, "emote": emote } } })
};

module.exports.help = {
    name: 'addrole',
    usage: "addrole (message UID) (emote) (mention role)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
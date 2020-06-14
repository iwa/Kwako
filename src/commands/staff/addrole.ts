import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if (msg.author.id != process.env.IWA) return;
    let dbEmbed = await db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let embed = await msg.channel.messages.fetch(args[0])

    let emote = args[1]
    try {
        embed.react(emote)
    } catch (ex) {
        return msg.reply(":x: > Can't react!")
    }

    let roleID = args[2]
    let role = msg.guild.roles.fetch(roleID);
    if (!role) return msg.reply(":x: > That role doesn't exist!")

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            console.error(ex)
        }
    }

    await db.collection('msg').updateOne({ _id: args[0] }, { $push: { roles: { "id": roleID, "emote": emote } } })
};

module.exports.help = {
    name: 'addrole',
    usage: "?addrole",
    staff: true
};
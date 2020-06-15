import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    let dbEmbed = await db.collection('msg').findOne({ _id: args[0] })
    if (!dbEmbed) return msg.reply(":x: > That message doesn't exist!")
    let fetchMsg = await msg.channel.messages.fetch(args[0])

    args.shift()
    let embed = args.join(' ')
    embed = JSON.parse(embed)

    let sent = await fetchMsg.edit(embed)

    let embed2 = sent.embeds[0];
    embed2.setFooter(sent.id);

    await sent.edit(embed2);

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            console.error(ex)
        }
    }
};

module.exports.help = {
    name: 'editembed',
    usage: "editembed (message id) (new embed)",
    staff: true
};
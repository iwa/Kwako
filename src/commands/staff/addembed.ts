import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA || process.env.SUDO == '0')) return;
    let embed = args.join(' ')
    embed = JSON.parse(embed)

    let sent = await msg.channel.send(embed)

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            console.error(ex)
        }
    }

    let embed2 = sent.embeds[0];
    embed2.setFooter(sent.id);

    await sent.edit(embed2);

    await db.collection('msg').insertOne({ _id: (await sent).id, channel: (await sent).channel.id })
};

module.exports.help = {
    name: 'addembed',
    usage: "addembed",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
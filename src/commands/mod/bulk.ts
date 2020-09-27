import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    if (msg.channel.type !== "dm") {
        await msg.delete().catch(console.error);

        let messages = await msg.channel.messages.fetch({ limit: 100 }, false)

        for(const message of messages)
            await message[1].delete()
                .catch(() => {return});;

        Kwako.log.info({msg: 'bulk', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, bulk: { channel: msg.channel.id, name: msg.channel.name }});
    }
};

module.exports.help = {
    name: 'bulk',
    usage: 'bulk',
    staff: true,
    perms: ['MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
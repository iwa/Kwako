import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = (msg: Message, args: string[]) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    if (args.length !== 0) {
        let channel: any = msg.channel
        if (msg.channel.type !== "dm") {
            msg.delete().catch(err => Kwako.log.error(err));
            let nb = parseInt(args[0])
            msg.channel.bulkDelete(nb)
                .then(() => {
                    Kwako.log.info({msg: 'bulk', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, bulk: { channel: channel.id, name: channel.name, x: nb }});
                })
                .catch(err => Kwako.log.error(err));
        }
    }
    else
        return msg.channel.send({ "embed": { "title": ":x: > **Incomplete command.**", "color": 13632027 } });
};

module.exports.help = {
    name: 'bulk',
    usage: 'bulk (number of messages to delete)',
    staff: true,
    perms: ['MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};
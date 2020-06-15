import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;
    staff.bulk(msg, args);
};

module.exports.help = {
    name: 'bulk',
    usage: 'bulk (number of messages to delete)',
    staff: true
};